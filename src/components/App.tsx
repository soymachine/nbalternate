import { useState } from 'react';
import type { PlayoffBracket, TeamWithRoster } from '../lib/types';
import { getTeamsWithRosters } from '../lib/nbaApi';
import { selectPlayoffTeams, simulateBracket } from '../lib/simulator';
import { BracketView } from './BracketView';

const YEAR_RANGE = { min: 1985, max: 1995 };

const LOADING_MESSAGES = [
  'Traveling back in time…',
  'Assembling rosters from the alternate timeline…',
  'Scouting the East conference…',
  'Scouting the West conference…',
  'The commissioner flips the lottery balls…',
  'Seeding the bracket…',
  'Tip-off in the alternate universe…',
  'The scoreboard in dimension X-NBA is lighting up…',
  'Crunching box scores across the multiverse…',
  'Almost there — the buzzer is about to sound!',
];

export default function App() {
  const [year, setYear] = useState<number>(1991);
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    setBracket(null);
    setLoading(true);

    // Cycle through loading messages
    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2500);

    try {
      // Fetch ESPN standings + build rosters client-side
      const teamsRaw = await getTeamsWithRosters(year);

      const teams: TeamWithRoster[] = teamsRaw.map(t => ({
        team: t.team,
        players: t.players,
        winPct: t.winPct,
        rawWinPct: t.winPct,
        adjustedScore: t.winPct,
        seed: 0,
      }));

      // Apply random jitter and select 8 East + 8 West playoff teams
      const { east, west } = selectPlayoffTeams(teams, year);

      // Simulate the full bracket
      const result = simulateBracket(east, west, year);

      setBracket(result);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏀</span>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                NBA<span className="text-nba-red">alternate</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Parallel Universe Playoffs</p>
            </div>
          </div>

          {bracket && (
            <button
              onClick={() => setBracket(null)}
              className="ml-auto text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
            >
              ← New Simulation
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      {!bracket && !loading && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-12 animate-fade-in">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-nba-blue/20 border border-nba-blue/30 text-nba-blue text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
              What if...?
            </div>
            <h2 className="text-5xl font-black mb-4 leading-tight">
              Rewrite NBA<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nba-red to-orange-400">
                History
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Pick a year. We'll grab the real rosters, remix the brackets,
              and simulate every single game — box score and all — in an alternate universe.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            {/* Year selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Season Year
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={YEAR_RANGE.min}
                  max={YEAR_RANGE.max}
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="flex-1 accent-nba-red"
                />
                <span className="text-3xl font-black text-nba-red tabular-nums w-20 text-center">
                  {year}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {year - 1}–{year} NBA Season
              </p>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-nba-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition-colors uppercase tracking-wide"
            >
              Generate Alternate Playoffs
            </button>
          </div>

          <p className="text-center text-xs text-gray-700 mt-8">
            Historical rosters bundled locally • Standings from <span className="text-gray-500">ESPN</span> • Simulation is purely fictional
          </p>
        </main>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-nba-red animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🏀</span>
          </div>
          <p className="text-gray-300 text-lg font-medium animate-pulse-slow text-center max-w-sm">
            {loadingMsg}
          </p>
          <p className="text-gray-600 text-sm mt-3">
            Fetching {year - 1}–{year} season data…
          </p>
        </div>
      )}

      {/* Bracket */}
      {bracket && !loading && (
        <div className="animate-fade-in">
          <BracketView bracket={bracket} />
        </div>
      )}
    </div>
  );
}
