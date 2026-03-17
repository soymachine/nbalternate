import type { SeriesResult, GameResult } from '../lib/types';
import { espnLogo } from '../lib/theme';

interface Props {
  series: SeriesResult;
  onGameClick: (data: { game: GameResult; homeTeam: string; awayTeam: string; homeTeamId: number; awayTeamId: number }) => void;
  compact?: boolean;
  finals?: boolean;
}

const CONF_ACCENT: Record<string, string> = {
  East:   '#1D428A',
  West:   '#C8102E',
  Finals: '#FFB81C',
};
const CONF_GLOW: Record<string, string> = {
  East:   'rgba(29,66,138,0.28)',
  West:   'rgba(200,16,46,0.28)',
  Finals: 'rgba(255,184,28,0.28)',
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
      background: 'var(--c-surface)',
      borderRadius: 10,
      border: '1px solid var(--c-border)',
      borderLeft: `3px solid ${accent}`,
      overflow: 'hidden',
      boxShadow: finals
        ? `0 0 24px ${glow}, 0 4px 20px rgba(0,0,0,0.18)`
        : '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {/* Teams */}
      <div style={{ padding: '10px 12px 8px' }}>
        <TeamRow
          team={teamA.team} seed={teamA.seed} wins={aWins}
          isWinner={aIsWinner} accent={accent}
        />
        <div style={{ height: 1, background: 'var(--c-border-sm)', margin: '5px 0' }} />
        <TeamRow
          team={teamB.team} seed={teamB.seed} wins={bWins}
          isWinner={!aIsWinner} accent={accent}
        />
      </div>

      {/* Game pills */}
      <div style={{ borderTop: '1px solid var(--c-border-sm)', padding: '6px 12px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {games.map(g => {
          const aIsHome = g.homeTeam === teamA.team.abbreviation;
          const aWon    = g.winner   === teamA.team.abbreviation;
          return (
            <button key={g.gameNumber}
              onClick={() => onGameClick({
                game: g,
                homeTeam: aIsHome ? `${teamA.team.city} ${teamA.team.name}` : `${teamB.team.city} ${teamB.team.name}`,
                awayTeam: aIsHome ? `${teamB.team.city} ${teamB.team.name}` : `${teamA.team.city} ${teamA.team.name}`,
                homeTeamId: aIsHome ? teamA.team.id : teamB.team.id,
                awayTeamId: aIsHome ? teamB.team.id : teamA.team.id,
              })}
              title={`G${g.gameNumber}: ${g.awayTeam} ${g.awayScore}–${g.homeScore} ${g.homeTeam} — click for box score`}
              style={{
                padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em',
                background: aWon ? accent : 'var(--c-pill-off)',
                color: aWon ? '#fff' : 'var(--c-pill-off-text)',
                boxShadow: aWon ? `0 2px 8px ${glow}` : 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >G{g.gameNumber}</button>
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({ team, seed, wins, isWinner, accent }: {
  team: { id: number; abbreviation: string; city: string; name: string };
  seed: number; wins: number; isWinner: boolean; accent: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {/* Seed */}
      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 11, color: 'var(--c-text5)', minWidth: 12, textAlign: 'right', flexShrink: 0 }}>{seed}</span>

      {/* Logo */}
      <img
        src={espnLogo(team.id)}
        alt={team.abbreviation}
        width={20} height={20}
        style={{ objectFit: 'contain', opacity: isWinner ? 1 : 0.35, flexShrink: 0 }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Abbreviation */}
      <span title={`${team.city} ${team.name}`} style={{
        fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 14,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: isWinner ? 'var(--c-text1)' : 'var(--c-text-off)',
      }}>{team.abbreviation}</span>

      {/* Wins */}
      <span style={{
        fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, lineHeight: 1,
        color: isWinner ? accent : 'var(--c-score-off)',
        textShadow: isWinner ? `0 0 12px ${accent}90` : 'none',
      }}>{wins}</span>
      {isWinner && <span style={{ fontSize: 11, color: accent, flexShrink: 0 }}>✓</span>}
    </div>
  );
}
