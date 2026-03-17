import { useState } from 'react';
import type { PlayoffBracket, GameResult } from '../lib/types';
import { SeriesCard } from './SeriesCard';
import { GameModal } from './GameModal';
import { espnLogo } from '../lib/theme';

interface Props { bracket: PlayoffBracket; }

type SelectedGame = {
  game: GameResult; homeTeam: string; awayTeam: string;
  homeTeamId: number; awayTeamId: number;
};

const COL_LABELS = ['1ST ROUND','CONF. SEMIS','CONF. FINALS','NBA FINALS','CONF. FINALS','CONF. SEMIS','1ST ROUND'];

export function BracketView({ bracket }: Props) {
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null);
  const champ = bracket.champion;

  return (
    <div style={{ paddingBottom: 60 }}>

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
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {/* Logo */}
          <img
            src={espnLogo(champ.team.id)}
            alt={champ.team.abbreviation}
            width={64} height={64}
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(255,184,28,0.5))' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: '#8a6a00', textTransform: 'uppercase', marginBottom: 4 }}>
              🏆 Alternate Universe Champion — {bracket.year - 1}–{bracket.year}
            </div>
            <div style={{
              fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 38, lineHeight: 1,
              letterSpacing: '0.02em', textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #FFE180 0%, #FFB81C 50%, #E8960A 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(255,184,28,0.5))',
            }}>{champ.team.city} {champ.team.name}</div>
            <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: '#6a5000', marginTop: 3, letterSpacing: '0.08em' }}>
              Seed #{champ.seed} · {champ.team.conference} Conference · Win% {(champ.rawWinPct * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── BRACKET ── */}
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
                <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#8a6a00', textTransform: 'uppercase' }}>🏆 NBA Finals</span>
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
