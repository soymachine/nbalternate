import { useState } from 'react';
import type { PlayoffBracket } from '../lib/types';
import { buildLeaderboard, topBy, type PlayoffLeader } from '../lib/leaderboard';

interface Props {
  bracket: PlayoffBracket;
}

type Category = 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg';

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'ppg', label: 'Points',   icon: '🔥', color: 'text-nba-red'    },
  { key: 'rpg', label: 'Rebounds', icon: '💪', color: 'text-blue-400'   },
  { key: 'apg', label: 'Assists',  icon: '🎯', color: 'text-green-400'  },
  { key: 'spg', label: 'Steals',   icon: '⚡', color: 'text-yellow-400' },
  { key: 'bpg', label: 'Blocks',   icon: '🛡', color: 'text-purple-400' },
];

const POS_COLORS: Record<string, string> = {
  PG: 'bg-blue-900/60 text-blue-300',
  SG: 'bg-cyan-900/60 text-cyan-300',
  SF: 'bg-green-900/60 text-green-300',
  PF: 'bg-orange-900/60 text-orange-300',
  C:  'bg-purple-900/60 text-purple-300',
};

function pct(n: number) {
  return n === 0 ? '—' : (n * 100).toFixed(1) + '%';
}

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-gray-500 font-bold tabular-nums w-6 text-center text-sm">{rank}</span>;
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
      <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function LeaderTable({
  leaders,
  category,
  color,
}: {
  leaders: PlayoffLeader[];
  category: Category;
  color: string;
}) {
  const maxVal = leaders[0]?.[category] as number ?? 1;

  const barColor: Record<Category, string> = {
    ppg: 'bg-nba-red',
    rpg: 'bg-blue-500',
    apg: 'bg-green-500',
    spg: 'bg-yellow-500',
    bpg: 'bg-purple-500',
  };

  return (
    <div className="space-y-1">
      {leaders.map(p => (
        <div
          key={p.playerId}
          className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 transition-colors group"
        >
          {/* Rank */}
          <div className="w-7 flex-shrink-0 flex justify-center">
            <MedalBadge rank={p.rank} />
          </div>

          {/* Name + team */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm truncate">{p.playerName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${POS_COLORS[p.position] ?? 'bg-gray-800 text-gray-400'}`}>
                {p.position}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{p.teamAbb}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-600">{p.gp}G</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-600">{p.mpg} min</span>
            </div>
            <StatBar value={p[category] as number} max={maxVal} color={barColor[category]} />
          </div>

          {/* Secondary stats */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
            {category !== 'ppg' && <span>{p.ppg} pts</span>}
            {category !== 'rpg' && <span>{p.rpg} reb</span>}
            {category !== 'apg' && <span>{p.apg} ast</span>}
            <span>{pct(p.fgPct)} FG</span>
          </div>

          {/* Main stat */}
          <div className={`text-2xl font-black tabular-nums flex-shrink-0 ${color}`}>
            {p[category] as number}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardView({ bracket }: Props) {
  const [active, setActive] = useState<Category>('ppg');
  const leaders = buildLeaderboard(bracket);
  const cat = CATEGORIES.find(c => c.key === active)!;
  const top = topBy(leaders, active, 15);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-1">
          Playoff Leaders
        </h2>
        <p className="text-gray-500 text-sm">
          {bracket.year - 1}–{bracket.year} Alternate Universe Playoffs
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
              active === c.key
                ? 'bg-gray-800 text-white shadow'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-base">{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 px-4">
        <span className={`text-sm font-bold uppercase tracking-widest ${cat.color}`}>
          {cat.icon} {cat.label} per game
        </span>
        <span className="text-gray-700 text-xs ml-auto">top 15 · min. 2 games</span>
      </div>

      {/* Table */}
      <LeaderTable leaders={top} category={active} color={cat.color} />

      {/* Champion callout */}
      <div className="mt-8 bg-yellow-950/40 border border-yellow-800/40 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs text-yellow-600 font-bold uppercase tracking-widest">Champion</p>
          <p className="text-white font-black">{bracket.champion.team.fullName}</p>
        </div>
      </div>
    </div>
  );
}
