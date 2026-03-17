import type { SeriesResult, GameResult } from '../lib/types';

interface Props {
  series: SeriesResult;
  onGameClick: (data: { game: GameResult; homeTeam: string; awayTeam: string }) => void;
  compact?: boolean;
  finals?: boolean;
}

const CONF_COLORS: Record<string, string> = {
  East: 'text-nba-blue',
  West: 'text-nba-red',
  Finals: 'text-yellow-400',
};

const CONF_BORDER: Record<string, string> = {
  East: 'border-nba-blue/30',
  West: 'border-nba-red/30',
  Finals: 'border-yellow-500/40',
};

export function SeriesCard({ series, onGameClick, compact = false, finals = false }: Props) {
  const { teamA, teamB, games, winner, seriesScore } = series;
  const conf = series.conference ?? 'East';

  const aIsWinner = winner.team.id === teamA.team.id;
  const [aWins, bWins] = seriesScore;

  return (
    <div
      className={`bg-gray-900 border rounded-xl overflow-hidden ${CONF_BORDER[conf]} ${
        finals ? 'ring-1 ring-yellow-500/30' : ''
      }`}
    >
      {/* Teams header */}
      <div className="px-3 py-2 border-b border-gray-800">
        <TeamRow
          name={`${teamA.team.abbreviation}`}
          fullName={`${teamA.team.city} ${teamA.team.name}`}
          seed={teamA.seed}
          wins={aWins}
          isWinner={aIsWinner}
          conf={conf}
        />
        <div className="border-t border-gray-800 mt-1.5 pt-1.5">
          <TeamRow
            name={`${teamB.team.abbreviation}`}
            fullName={`${teamB.team.city} ${teamB.team.name}`}
            seed={teamB.seed}
            wins={bWins}
            isWinner={!aIsWinner}
            conf={conf}
          />
        </div>
      </div>

      {/* Games list */}
      {!compact && (
        <div className="px-3 py-2 space-y-1">
          {games.map(g => (
            <GameRow key={g.gameNumber} game={g} series={series} onGameClick={onGameClick} />
          ))}
        </div>
      )}

      {compact && (
        <div className="px-3 py-2">
          <div className="flex gap-1 flex-wrap">
            {games.map(g => {
              const aIsHome = g.homeTeam === teamA.team.abbreviation;
              const homeScore = g.homeScore;
              const awayScore = g.awayScore;
              const aWon = g.winner === teamA.team.abbreviation;

              return (
                <button
                  key={g.gameNumber}
                  onClick={() =>
                    onGameClick({
                      game: g,
                      homeTeam: aIsHome
                        ? `${teamA.team.city} ${teamA.team.name}`
                        : `${teamB.team.city} ${teamB.team.name}`,
                      awayTeam: aIsHome
                        ? `${teamB.team.city} ${teamB.team.name}`
                        : `${teamA.team.city} ${teamA.team.name}`,
                    })
                  }
                  className={`text-xs px-2 py-0.5 rounded font-mono hover:ring-1 ring-white/20 transition-all ${
                    aWon ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                  title={`G${g.gameNumber}: ${g.homeTeam} ${homeScore} - ${g.awayScore} ${g.awayTeam}`}
                >
                  G{g.gameNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamRow({
  name,
  fullName,
  seed,
  wins,
  isWinner,
  conf,
}: {
  name: string;
  fullName: string;
  seed: number;
  wins: number;
  isWinner: boolean;
  conf: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${isWinner ? 'text-white' : 'text-gray-500'}`}>
      <span className="text-xs text-gray-600 w-4 text-right">{seed}</span>
      <span
        className={`text-sm font-bold flex-1 truncate ${isWinner ? CONF_COLORS[conf] : ''}`}
        title={fullName}
      >
        {name}
      </span>
      <span
        className={`text-sm font-black tabular-nums ${
          isWinner ? 'text-white' : 'text-gray-600'
        }`}
      >
        {wins}
      </span>
      {isWinner && <span className="text-xs">✓</span>}
    </div>
  );
}

function GameRow({
  game,
  series,
  onGameClick,
}: {
  game: GameResult;
  series: SeriesResult;
  onGameClick: Props['onGameClick'];
}) {
  const homeIsA = game.homeTeam === series.teamA.team.abbreviation;
  const homeTeamFull = homeIsA
    ? `${series.teamA.team.city} ${series.teamA.team.name}`
    : `${series.teamB.team.city} ${series.teamB.team.name}`;
  const awayTeamFull = homeIsA
    ? `${series.teamB.team.city} ${series.teamB.team.name}`
    : `${series.teamA.team.city} ${series.teamA.team.name}`;

  return (
    <button
      onClick={() =>
        onGameClick({ game, homeTeam: homeTeamFull, awayTeam: awayTeamFull })
      }
      className="w-full flex items-center gap-2 text-xs hover:bg-gray-800 px-1 py-0.5 rounded transition-colors text-left"
    >
      <span className="text-gray-600 w-4">G{game.gameNumber}</span>
      <span className="text-gray-400 flex-1">
        {game.awayTeam} @ {game.homeTeam}
      </span>
      <span className="font-mono font-bold tabular-nums text-white">
        {game.awayScore}–{game.homeScore}
      </span>
    </button>
  );
}
