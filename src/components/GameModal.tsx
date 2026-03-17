import { useEffect } from 'react';
import type { GameResult, PlayerGameStats } from '../lib/types';

interface Props {
  game: GameResult;
  homeTeamName: string;
  awayTeamName: string;
  onClose: () => void;
}

export function GameModal({ game, homeTeamName, awayTeamName, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const awayWon = game.winner === game.awayTeam;
  const homeWon = !awayWon;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-2xl font-black tabular-nums ${awayWon ? 'text-white' : 'text-gray-500'}`}>
                {game.awayScore}
              </p>
              <p className={`text-sm font-bold ${awayWon ? 'text-white' : 'text-gray-500'}`}>
                {game.awayTeam}
              </p>
              <p className="text-xs text-gray-600 truncate max-w-[120px]">{awayTeamName}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Game {game.gameNumber}
              </p>
              <p className="text-xs text-gray-700">FINAL</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black tabular-nums ${homeWon ? 'text-white' : 'text-gray-500'}`}>
                {game.homeScore}
              </p>
              <p className={`text-sm font-bold ${homeWon ? 'text-white' : 'text-gray-500'}`}>
                {game.homeTeam}
              </p>
              <p className="text-xs text-gray-600 truncate max-w-[120px]">{homeTeamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Box Scores */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 divide-x divide-gray-800">
            {/* Away */}
            <BoxScoreTable
              players={game.awayBoxScore}
              teamName={awayTeamName}
              abbr={game.awayTeam}
              score={game.awayScore}
              isWinner={awayWon}
            />
            {/* Home */}
            <BoxScoreTable
              players={game.homeBoxScore}
              teamName={homeTeamName}
              abbr={game.homeTeam}
              score={game.homeScore}
              isWinner={homeWon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxScoreTable({
  players,
  teamName,
  abbr,
  score,
  isWinner,
}: {
  players: PlayerGameStats[];
  teamName: string;
  abbr: string;
  score: number;
  isWinner: boolean;
}) {
  const sorted = [...players].sort((a, b) => b.minutes - a.minutes);
  const totals = players.reduce(
    (acc, p) => ({
      pts: acc.pts + p.pts,
      reb: acc.reb + p.reb,
      ast: acc.ast + p.ast,
      stl: acc.stl + p.stl,
      blk: acc.blk + p.blk,
      turnover: acc.turnover + p.turnover,
      fgm: acc.fgm + p.fgm,
      fga: acc.fga + p.fga,
      fg3m: acc.fg3m + p.fg3m,
      fg3a: acc.fg3a + p.fg3a,
      ftm: acc.ftm + p.ftm,
      fta: acc.fta + p.fta,
    }),
    { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, turnover: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0 }
  );

  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`font-black text-sm ${isWinner ? 'text-white' : 'text-gray-400'}`}>
            {abbr} — {teamName}
          </p>
        </div>
        {isWinner && (
          <span className="text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-700/30 px-2 py-0.5 rounded font-bold">
            WIN
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-600 border-b border-gray-800">
              <th className="text-left pb-1 pr-2 font-semibold">PLAYER</th>
              <th className="text-right pb-1 px-1 font-semibold">MIN</th>
              <th className="text-right pb-1 px-1 font-semibold text-white">PTS</th>
              <th className="text-right pb-1 px-1 font-semibold">REB</th>
              <th className="text-right pb-1 px-1 font-semibold">AST</th>
              <th className="text-right pb-1 px-1 font-semibold">STL</th>
              <th className="text-right pb-1 px-1 font-semibold">BLK</th>
              <th className="text-right pb-1 px-1 font-semibold">TO</th>
              <th className="text-right pb-1 px-1 font-semibold">FG</th>
              <th className="text-right pb-1 px-1 font-semibold">3P</th>
              <th className="text-right pb-1 px-1 font-semibold">FT</th>
              <th className="text-right pb-1 px-1 font-semibold">+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr
                key={p.playerId}
                className={`border-b border-gray-800/50 ${
                  p.minutes === 0 ? 'text-gray-700' : 'text-gray-300'
                } hover:bg-gray-800/30`}
              >
                <td className="py-1 pr-2 font-medium truncate max-w-[100px]" title={p.playerName}>
                  {p.playerName || '—'}
                  <span className="text-gray-600 ml-1">{p.position}</span>
                </td>
                <td className="text-right py-1 px-1 font-mono">{p.minutes}</td>
                <td className="text-right py-1 px-1 font-black text-white">{p.pts}</td>
                <td className="text-right py-1 px-1 font-mono">{p.reb}</td>
                <td className="text-right py-1 px-1 font-mono">{p.ast}</td>
                <td className="text-right py-1 px-1 font-mono">{p.stl}</td>
                <td className="text-right py-1 px-1 font-mono">{p.blk}</td>
                <td className="text-right py-1 px-1 font-mono">{p.turnover}</td>
                <td className="text-right py-1 px-1 font-mono">
                  {p.fgm}/{p.fga}
                </td>
                <td className="text-right py-1 px-1 font-mono">
                  {p.fg3m}/{p.fg3a}
                </td>
                <td className="text-right py-1 px-1 font-mono">
                  {p.ftm}/{p.fta}
                </td>
                <td
                  className={`text-right py-1 px-1 font-mono font-bold ${
                    p.plusMinus > 0 ? 'text-green-400' : p.plusMinus < 0 ? 'text-red-400' : 'text-gray-600'
                  }`}
                >
                  {p.plusMinus > 0 ? '+' : ''}{p.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-gray-400 font-bold border-t border-gray-700">
              <td className="py-1 pr-2">TOTALS</td>
              <td />
              <td className="text-right py-1 px-1 font-black text-white">{score}</td>
              <td className="text-right py-1 px-1">{totals.reb}</td>
              <td className="text-right py-1 px-1">{totals.ast}</td>
              <td className="text-right py-1 px-1">{totals.stl}</td>
              <td className="text-right py-1 px-1">{totals.blk}</td>
              <td className="text-right py-1 px-1">{totals.turnover}</td>
              <td className="text-right py-1 px-1">
                {totals.fgm}/{totals.fga}
              </td>
              <td className="text-right py-1 px-1">
                {totals.fg3m}/{totals.fg3a}
              </td>
              <td className="text-right py-1 px-1">
                {totals.ftm}/{totals.fta}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
