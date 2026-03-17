import { useState } from 'react';
import type { PlayoffBracket, SeriesResult, TeamWithRoster } from '../lib/types';
import { SeriesCard } from './SeriesCard';
import { GameModal } from './GameModal';
import type { GameResult } from '../lib/types';

interface Props {
  bracket: PlayoffBracket;
}

export function BracketView({ bracket }: Props) {
  const [selectedGame, setSelectedGame] = useState<{
    game: GameResult;
    homeTeam: string;
    awayTeam: string;
  } | null>(null);

  const champ = bracket.champion;

  return (
    <div className="pb-20">
      {/* Champion banner */}
      <div className="bg-gradient-to-r from-yellow-950 via-yellow-900 to-yellow-950 border-b border-yellow-700/40 py-6 px-6 text-center">
        <p className="text-yellow-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">
          🏆 Alternate Universe Champion — {bracket.year}
        </p>
        <h2 className="text-4xl font-black text-yellow-100">
          {champ.team.city} {champ.team.name}
        </h2>
        <p className="text-yellow-600 text-sm mt-1">
          Seed #{champ.seed} · {champ.team.conference} Conference ·{' '}
          Win%: {(champ.rawWinPct * 100).toFixed(1)}%
        </p>
      </div>

      {/* Bracket layout */}
      <div className="max-w-screen-2xl mx-auto px-4 pt-8 overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Column headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['1st Round', 'Conf. Semis', 'Conf. Finals', 'NBA Finals', 'Conf. Finals', 'Conf. Semis', '1st Round'].map(
              (label, i) => (
                <div key={i} className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest py-1">
                  {label}
                </div>
              )
            )}
          </div>

          {/* Main bracket row */}
          <div className="flex gap-2 items-start">
            {/* EAST — R1 */}
            <div className="flex flex-col gap-4 flex-1">
              {bracket.eastR1.map(s => (
                <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />
              ))}
            </div>

            {/* EAST — R2 */}
            <div className="flex flex-col gap-4 flex-1 mt-12">
              {bracket.eastR2.map(s => (
                <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />
              ))}
            </div>

            {/* EAST — Finals */}
            <div className="flex flex-col flex-1 mt-24">
              <SeriesCard series={bracket.eastFinal} onGameClick={setSelectedGame} />
            </div>

            {/* NBA Finals (center) */}
            <div className="flex flex-col flex-1 mt-32">
              <div className="text-center mb-2">
                <span className="text-xs font-black text-yellow-500 tracking-widest uppercase">
                  🏆 NBA Finals
                </span>
              </div>
              <SeriesCard series={bracket.nbaFinals} onGameClick={setSelectedGame} finals />
            </div>

            {/* WEST — Finals */}
            <div className="flex flex-col flex-1 mt-24">
              <SeriesCard series={bracket.westFinal} onGameClick={setSelectedGame} />
            </div>

            {/* WEST — R2 */}
            <div className="flex flex-col gap-4 flex-1 mt-12">
              {bracket.westR2.map(s => (
                <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />
              ))}
            </div>

            {/* WEST — R1 */}
            <div className="flex flex-col gap-4 flex-1">
              {bracket.westR1.map(s => (
                <SeriesCard key={s.matchupId} series={s} onGameClick={setSelectedGame} compact />
              ))}
            </div>
          </div>

          {/* Conference labels */}
          <div className="flex justify-between mt-8 px-2">
            <span className="text-sm font-bold text-nba-blue uppercase tracking-widest">← East Conference</span>
            <span className="text-sm font-bold text-nba-red uppercase tracking-widest">West Conference →</span>
          </div>
        </div>
      </div>

      {/* Series legend */}
      <div className="max-w-screen-2xl mx-auto px-4 mt-8">
        <p className="text-xs text-gray-600 text-center">
          Click any game result to see the full box score
        </p>
      </div>

      {/* Game modal */}
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
