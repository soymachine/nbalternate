import { useState } from 'react';
import type { PlayoffBracket, GameResult } from '../lib/types';
import { SeriesCard } from './SeriesCard';
import { GameModal } from './GameModal';

interface Props { bracket: PlayoffBracket; }

const COL_LABELS = ['1ST ROUND', 'CONF. SEMIS', 'CONF. FINALS', 'NBA FINALS', 'CONF. FINALS', 'CONF. SEMIS', '1ST ROUND'];

export function BracketView({ bracket }: Props) {
  const [selectedGame, setSelectedGame] = useState<{ game: GameResult; homeTeam: string; awayTeam: string } | null>(null);
  const champ = bracket.champion;

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── CHAMPION BANNER ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(90deg, #0A0C08 0%, #1a1500 30%, #221900 50%, #1a1500 70%, #0A0C08 100%)',
        borderBottom: '1px solid rgba(255,184,28,0.2)',
        padding: '24px 24px',
        textAlign: 'center',
      }}>
        {/* Gold radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,184,28,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: '#8a6a00', textTransform: 'uppercase', marginBottom: 6 }}>
            🏆 Alternate Universe Champion — {bracket.year - 1}–{bracket.year}
          </div>
          <div style={{
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 42, lineHeight: 1,
            letterSpacing: '0.02em', textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #FFE180 0%, #FFB81C 50%, #E8960A 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 16px rgba(255,184,28,0.5))',
          }}>
            {champ.team.city} {champ.team.name}
          </div>
          <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 13, color: '#6a5000', marginTop: 4, letterSpacing: '0.08em' }}>
            Seed #{champ.seed} · {champ.team.conference} Conference · Win% {(champ.rawWinPct * 100).toFixed(1)}%
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
                color: i === 3 ? '#6a5000' : (i < 3 ? '#1a3060' : '#60101a'),
                borderBottom: `2px solid ${i === 3 ? '#FFB81C30' : i < 3 ? '#1D428A30' : '#C8102E30'}`,
                paddingBottom: 8,
              }}>{label}</div>
            ))}
          </div>

          {/* Bracket columns */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {/* E R1 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bracket.eastR1.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
            </div>
            {/* E R2 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 56 }}>
              {bracket.eastR2.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
            </div>
            {/* E Finals */}
            <div style={{ flex: 1, marginTop: 112 }}>
              <SeriesCard series={bracket.eastFinal} onGameClick={setSelectedGame} />
            </div>
            {/* NBA Finals */}
            <div style={{ flex: 1, marginTop: 148 }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#6a5000', textTransform: 'uppercase' }}>🏆 NBA Finals</span>
              </div>
              <SeriesCard series={bracket.nbaFinals} onGameClick={setSelectedGame} finals />
            </div>
            {/* W Finals */}
            <div style={{ flex: 1, marginTop: 112 }}>
              <SeriesCard series={bracket.westFinal} onGameClick={setSelectedGame} />
            </div>
            {/* W R2 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 56 }}>
              {bracket.westR2.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
            </div>
            {/* W R1 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bracket.westR1.map(s => <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />)}
            </div>
          </div>

          {/* Conference labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingBottom: 8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#1D428A', textTransform: 'uppercase' }}>← Eastern Conference</span>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: 11, color: '#253545', letterSpacing: '0.1em' }}>Click any game to see box score</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: '#C8102E', textTransform: 'uppercase' }}>Western Conference →</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedGame && (
        <GameModal
          game={selectedGame.game}
          homeTeamName={selectedGame.homeTeam}
          awayTeamName={selectedGame.awayTeam}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
