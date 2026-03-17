import type { SeriesResult, GameResult } from '../lib/types';

interface Props {
  series: SeriesResult;
  onGameClick: (data: { game: GameResult; homeTeam: string; awayTeam: string }) => void;
  compact?: boolean;
  finals?: boolean;
}

const CONF_ACCENT: Record<string, string> = {
  East:   '#1D428A',
  West:   '#C8102E',
  Finals: '#FFB81C',
};
const CONF_GLOW: Record<string, string> = {
  East:   'rgba(29,66,138,0.3)',
  West:   'rgba(200,16,46,0.3)',
  Finals: 'rgba(255,184,28,0.3)',
};

export function SeriesCard({ series, onGameClick, compact = false, finals = false }: Props) {
  const { teamA, teamB, games, winner, seriesScore } = series;
  const conf   = series.conference ?? 'East';
  const accent = CONF_ACCENT[conf];
  const glow   = CONF_GLOW[conf];
  const aIsWinner = winner.team.id === teamA.team.id;
  const [aWins, bWins] = seriesScore;

  return (
    <div style={{
      background: '#0F1623',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `3px solid ${accent}`,
      overflow: 'hidden',
      boxShadow: finals
        ? `0 0 24px ${glow}, 0 4px 20px rgba(0,0,0,0.5)`
        : '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      {/* Teams */}
      <div style={{ padding: '10px 12px 8px' }}>
        <TeamRow abbr={teamA.team.abbreviation} fullName={`${teamA.team.city} ${teamA.team.name}`}
          seed={teamA.seed} wins={aWins} isWinner={aIsWinner} accent={accent} />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '5px 0' }} />
        <TeamRow abbr={teamB.team.abbreviation} fullName={`${teamB.team.city} ${teamB.team.name}`}
          seed={teamB.seed} wins={bWins} isWinner={!aIsWinner} accent={accent} />
      </div>

      {/* Game pills */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '6px 12px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {games.map(g => {
          const aIsHome = g.homeTeam === teamA.team.abbreviation;
          const aWon    = g.winner === teamA.team.abbreviation;
          return (
            <button key={g.gameNumber}
              onClick={() => onGameClick({
                game: g,
                homeTeam: aIsHome ? `${teamA.team.city} ${teamA.team.name}` : `${teamB.team.city} ${teamB.team.name}`,
                awayTeam: aIsHome ? `${teamB.team.city} ${teamB.team.name}` : `${teamA.team.city} ${teamA.team.name}`,
              })}
              title={`G${g.gameNumber}: ${g.awayTeam} ${g.awayScore}–${g.homeScore} ${g.homeTeam} — click for box score`}
              style={{
                padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em',
                background: aWon ? accent : 'rgba(255,255,255,0.05)',
                color: aWon ? '#fff' : '#3a4f6a',
                boxShadow: aWon ? `0 2px 8px ${glow}` : 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
            >G{g.gameNumber}</button>
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({ abbr, fullName, seed, wins, isWinner, accent }:
  { abbr: string; fullName: string; seed: number; wins: number; isWinner: boolean; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 12, color: '#253545', minWidth: 14, textAlign: 'right' }}>{seed}</span>
      <span title={fullName} style={{
        fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 14,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: isWinner ? '#e8f0ff' : '#2e4060',
      }}>{abbr}</span>
      <span style={{
        fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, lineHeight: 1,
        color: isWinner ? accent : '#1a2535',
        textShadow: isWinner ? `0 0 12px ${accent}90` : 'none',
      }}>{wins}</span>
      {isWinner && <span style={{ fontSize: 11, color: accent }}>✓</span>}
    </div>
  );
}
