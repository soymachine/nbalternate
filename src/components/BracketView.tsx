import { useState, useEffect, type ReactNode } from 'react';
import type { PlayoffBracket, GameResult } from '../lib/types';
import { SeriesCard } from './SeriesCard';
import { GameModal } from './GameModal';
import { espnLogo } from '../lib/theme';
import { getFinalsMVP, type FinalsMVP } from '../lib/leaderboard';

interface Props { bracket: PlayoffBracket; }

type SelectedGame = {
  game: GameResult; homeTeam: string; awayTeam: string;
  homeTeamId: number; awayTeamId: number;
};

const COL_LABELS = ['1ST ROUND','CONF. SEMIS','CONF. FINALS','NBA FINALS','CONF. FINALS','CONF. SEMIS','1ST ROUND'];

// ── Finals MVP card ───────────────────────────────────────────────────────────
function FinalsMVPCard({ mvp }: { mvp: FinalsMVP }) {
  const fgDisplay = mvp.fgPct === 0 ? '—' : (mvp.fgPct * 100).toFixed(1) + '%';
  const stats = [
    { val: String(mvp.ppg), label: 'PPG' },
    { val: String(mvp.rpg), label: 'RPG' },
    { val: String(mvp.apg), label: 'APG' },
    { val: fgDisplay,       label: 'FG%' },
  ];
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(255,184,28,0.10) 0%, rgba(255,184,28,0.04) 60%, transparent 100%)',
      borderBottom: '1px solid rgba(255,184,28,0.18)',
    }}>
      <div style={{
        maxWidth: 1600, margin: '0 auto', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🏅</span>

        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 9,
            letterSpacing: '0.3em', textTransform: 'uppercase', color: '#FFB81C', marginBottom: 1,
          }}>Finals MVP</div>
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 20,
            letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--c-text1)',
            lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{mvp.playerName}</div>
          <div style={{
            fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11,
            color: 'var(--c-text3)', marginTop: 2, letterSpacing: '0.04em',
          }}>{mvp.teamAbb} · {mvp.position} · {mvp.gp}G in Finals</div>
        </div>

        <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
          {stats.map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, lineHeight: 1,
                letterSpacing: '0.02em', color: '#FFB81C',
              }}>{val}</div>
              <div style={{
                fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 9,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--c-text4)',
              }}>{label}</div>
            </div>
          ))}
        </div>

        <img
          src={espnLogo(mvp.teamId)} alt={mvp.teamAbb}
          width={36} height={36}
          style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(255,184,28,0.45))' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    </div>
  );
}

// ── Mobile helpers ────────────────────────────────────────────────────────────
function MobileRoundSection({ label, accent, children }: { label: string; accent: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        <span style={{
          fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: accent,
          padding: '0 8px', whiteSpace: 'nowrap',
        }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
      </div>
      {children}
    </div>
  );
}

function ConfLabel({ conf }: { conf: 'East' | 'West' }) {
  return (
    <div style={{
      fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 9,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: conf === 'East' ? '#1D428A' : '#C8102E',
      marginBottom: 6,
    }}>{conf}ern</div>
  );
}

function MobileBracket({ bracket, onGameClick }: {
  bracket: PlayoffBracket;
  onGameClick: (data: SelectedGame) => void;
}) {
  const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 };
  const col: React.CSSProperties    = { display: 'flex', flexDirection: 'column', gap: 8 };

  return (
    <div style={{ padding: '20px 12px 56px' }}>

      {/* NBA Finals */}
      <MobileRoundSection label="🏆 NBA Finals" accent="var(--c-champ-text)">
        <SeriesCard series={bracket.nbaFinals} onGameClick={onGameClick} finals />
      </MobileRoundSection>

      {/* Conference Finals */}
      <MobileRoundSection label="Conference Finals" accent="var(--c-text3)">
        <div style={twoCol}>
          <div style={col}>
            <ConfLabel conf="East" />
            <SeriesCard series={bracket.eastFinal} onGameClick={onGameClick} />
          </div>
          <div style={col}>
            <ConfLabel conf="West" />
            <SeriesCard series={bracket.westFinal} onGameClick={onGameClick} />
          </div>
        </div>
      </MobileRoundSection>

      {/* Conference Semifinals */}
      <MobileRoundSection label="Conference Semifinals" accent="var(--c-text3)">
        <div style={twoCol}>
          <div style={col}>
            <ConfLabel conf="East" />
            {bracket.eastR2.map(s => (
              <SeriesCard key={s.matchupId} series={s} onGameClick={onGameClick} compact />
            ))}
          </div>
          <div style={col}>
            <ConfLabel conf="West" />
            {bracket.westR2.map(s => (
              <SeriesCard key={s.matchupId} series={s} onGameClick={onGameClick} compact />
            ))}
          </div>
        </div>
      </MobileRoundSection>

      {/* First Round */}
      <MobileRoundSection label="First Round" accent="var(--c-text3)">
        <div style={twoCol}>
          <div style={col}>
            <ConfLabel conf="East" />
            {bracket.eastR1.map(s => (
              <SeriesCard key={s.matchupId} series={s} onGameClick={onGameClick} compact />
            ))}
          </div>
          <div style={col}>
            <ConfLabel conf="West" />
            {bracket.westR1.map(s => (
              <SeriesCard key={s.matchupId} series={s} onGameClick={onGameClick} compact />
            ))}
          </div>
        </div>
      </MobileRoundSection>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        borderTop: '1px solid var(--c-border-sm)', paddingTop: 12,
      }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: '#1D428A', textTransform: 'uppercase' }}>East</span>
        <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)', letterSpacing: '0.05em' }}>Tap any game pill for box score</span>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: '#C8102E', textTransform: 'uppercase' }}>West</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BracketView({ bracket }: Props) {
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const mvp   = getFinalsMVP(bracket);
  const champ = bracket.champion;

  return (
    <div style={{ paddingBottom: isMobile ? 0 : 60 }}>

      {/* ── CHAMPION BANNER ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--c-champ-bg)',
        borderBottom: '1px solid rgba(255,184,28,0.2)',
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,184,28,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <img
            src={espnLogo(champ.team.id)}
            alt={champ.team.abbreviation}
            width={64} height={64}
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(255,184,28,0.5))' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: 'var(--c-champ-text)', textTransform: 'uppercase', marginBottom: 4 }}>
              🏆 Alternate Universe Champion — {bracket.year - 1}–{bracket.year}
            </div>
            <div style={{
              fontFamily: 'Oswald, sans-serif', fontWeight: 700,
              fontSize: isMobile ? 28 : 38, lineHeight: 1,
              letterSpacing: '0.02em', textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #FFE180 0%, #FFB81C 50%, #E8960A 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(255,184,28,0.5))',
            }}>{champ.team.city} {champ.team.name}</div>
            <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: 'var(--c-champ-sub)', marginTop: 3, letterSpacing: '0.08em' }}>
              Seed #{champ.seed} · {champ.team.conference} Conference · Win% {(champ.rawWinPct * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── FINALS MVP ── */}
      {mvp && <FinalsMVPCard mvp={mvp} />}

      {/* ── MOBILE BRACKET ── */}
      {isMobile && <MobileBracket bracket={bracket} onGameClick={setSelectedGame} />}

      {/* ── DESKTOP BRACKET ── */}
      {!isMobile && (
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 16px 0', overflowX: 'auto' }}>
          <div style={{ minWidth: 1100 }}>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
              {COL_LABELS.map((label, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 10,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: i === 3 ? '#8a6a00' : (i < 3 ? '#1D428A' : '#C8102E'),
                  borderBottom: `2px solid ${i === 3 ? 'rgba(255,184,28,0.2)' : i < 3 ? 'rgba(29,66,138,0.2)' : 'rgba(200,16,46,0.2)'}`,
                  paddingBottom: 8, opacity: 0.8,
                }}>{label}</div>
              ))}
            </div>

            {/* Bracket columns */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bracket.eastR1.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 56 }}>
                {bracket.eastR2.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
              </div>
              <div style={{ flex: 1, marginTop: 112 }}>
                <SeriesCard series={bracket.eastFinal} onGameClick={setSelectedGame} />
              </div>
              <div style={{ flex: 1, marginTop: 148 }}>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: 'var(--c-champ-text)', textTransform: 'uppercase' }}>🏆 NBA Finals</span>
                </div>
                <SeriesCard series={bracket.nbaFinals} onGameClick={setSelectedGame} finals />
              </div>
              <div style={{ flex: 1, marginTop: 112 }}>
                <SeriesCard series={bracket.westFinal} onGameClick={setSelectedGame} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 56 }}>
                {bracket.westR2.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bracket.westR1.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
              </div>
            </div>

            {/* Conference labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, borderTop: '1px solid var(--c-border-sm)', paddingTop: 16 }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#1D428A', textTransform: 'uppercase' }}>← Eastern Conference</span>
              <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: 'var(--c-text4)', letterSpacing: '0.1em' }}>Click any game pill to see box score</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#C8102E', textTransform: 'uppercase' }}>Western Conference →</span>
            </div>
          </div>
        </div>
      )}

      {selectedGame && (
        <GameModal
          game={selectedGame.game}
          homeTeamName={selectedGame.homeTeam}
          awayTeamName={selectedGame.awayTeam}
          homeTeamId={selectedGame.homeTeamId}
          awayTeamId={selectedGame.awayTeamId}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
