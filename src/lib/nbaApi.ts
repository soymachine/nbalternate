import type { NBATeam, PlayerSeasonStats } from './types';
import { rosters, type RosterEntry } from '../data/rosters';

// ─── ESPN standings ───────────────────────────────────────────────────────────

const ESPN_STANDINGS = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';

export async function getStandings(
  year: number,
): Promise<(NBATeam & { wins: number; losses: number; winPct: number })[]> {
  // ESPN season year = ending year (user picks 1988 → 1987-88 season)
  const res = await fetch(`${ESPN_STANDINGS}?season=${year}&seasontype=2`);
  if (!res.ok) throw new Error(`ESPN standings error ${res.status}`);
  const json = await res.json();

  const teams: (NBATeam & { wins: number; losses: number; winPct: number })[] = [];
  for (const conf of json.children as any[]) {
    const conference: 'East' | 'West' = conf.abbreviation === 'East' ? 'East' : 'West';
    for (const entry of conf.standings.entries as any[]) {
      const t = entry.team;
      const sm: Record<string, number> = {};
      for (const s of entry.stats as any[]) sm[s.name] = parseFloat(s.value);
      teams.push({
        id: parseInt(t.id),
        name: t.name,
        abbreviation: t.abbreviation,
        city: t.location,
        conference,
        division: '',
        fullName: `${t.location} ${t.name}`,
        wins: sm.wins ?? 0,
        losses: sm.losses ?? 0,
        winPct: sm.winPercent ?? 0,
      });
    }
  }
  return teams;
}

// ─── Roster lookup from local data ───────────────────────────────────────────

// ESPN may use different abbreviations than what rosters.ts uses.
// This maps ESPN abbr → possible keys used in rosters.ts (in priority order)
const ESPN_TO_HISTORICAL: Record<string, string[]> = {
  // ESPN short forms → standard 3-letter rosters.ts keys
  NY:   ['NYK', 'NY'],         // New York Knicks (ESPN uses "NY")
  NJ:   ['NJN', 'NJ'],         // New Jersey Nets (ESPN uses "NJ")
  SA:   ['SAS', 'SAN', 'SA'],  // San Antonio Spurs (ESPN uses "SA")
  UTAH: ['UTA', 'UTAH'],       // Utah Jazz (ESPN uses "UTAH")
  GS:   ['GS', 'GSW'],         // Golden State Warriors
  // Franchise relocations
  OKC:  ['SEA', 'OKC'],        // Seattle SuperSonics → OKC in 2008
  BKN:  ['NJN', 'NJ', 'BKN'], // New Jersey Nets → Brooklyn in 2012
  MEM:  ['VAN', 'MEM'],        // Vancouver Grizzlies → Memphis in 2001
  CHA:  ['CHH', 'CHO', 'CHA'], // Charlotte Hornets / Bobcats
  NO:   ['NOH', 'NOP', 'NO'],  // New Orleans Hornets/Pelicans
  NOP:  ['NOH', 'NOP', 'NO'],
  WSH:  ['WSB', 'WSH'],        // Washington Bullets → Wizards in 1997
  WAS:  ['WSB', 'WSH', 'WAS'],
  SAC:  ['KCK', 'SAC'],        // Kansas City Kings → Sacramento in 1985
};

function findRosterKey(year: number, espnAbb: string): string | null {
  const yearRosters = rosters[String(year)];
  if (!yearRosters) return null;

  const abb = espnAbb.toUpperCase();
  if (yearRosters[abb]) return abb;

  for (const fallback of (ESPN_TO_HISTORICAL[abb] ?? [])) {
    if (yearRosters[fallback]) return fallback;
  }

  return null;
}

// ─── Position archetype stats (used when no real stats are provided) ──────────

function stableId(name: string): number {
  return (name.split('').reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0) >>> 0);
}

const ARCHETYPES: Record<string, {
  pts: number; ast: number; reb: number; stl: number; blk: number; to: number;
  fgPct: number; fg3Pct: number; ftPct: number; min: number;
  fga: number; fg3a: number; fta: number; oreb: number;
}> = {
  PG: { pts:16, ast:6.5, reb:3.5, stl:1.3, blk:0.2, to:2.5, fgPct:0.44, fg3Pct:0.36, ftPct:0.83, min:31, fga:13, fg3a:5.5, fta:3.5, oreb:0.5 },
  SG: { pts:16, ast:3.0, reb:3.8, stl:1.1, blk:0.3, to:1.8, fgPct:0.44, fg3Pct:0.37, ftPct:0.83, min:30, fga:13, fg3a:5.0, fta:3.0, oreb:0.6 },
  SF: { pts:15, ast:2.8, reb:5.5, stl:0.9, blk:0.5, to:1.7, fgPct:0.47, fg3Pct:0.34, ftPct:0.78, min:29, fga:12, fg3a:4.0, fta:3.0, oreb:0.8 },
  PF: { pts:13, ast:2.0, reb:7.5, stl:0.7, blk:1.1, to:1.5, fgPct:0.49, fg3Pct:0.30, ftPct:0.73, min:27, fga:10, fg3a:1.8, fta:3.5, oreb:1.8 },
  C:  { pts:12, ast:1.8, reb:9.5, stl:0.5, blk:1.6, to:1.5, fgPct:0.54, fg3Pct:0.12, ftPct:0.68, min:26, fga:9,  fg3a:0.4, fta:4.0, oreb:2.5 },
};

const SLOT_FACTOR = [1.0, 1.0, 1.0, 1.0, 1.0, 0.58, 0.58, 0.58, 0.58, 0.58, 0.30, 0.30, 0.30, 0.30, 0.30];

function buildStatsForPlayer(
  teamId: number,
  slot: number,
  entry: RosterEntry,
): PlayerSeasonStats {
  const arch = ARCHETYPES[entry.pos] ?? ARCHETYPES.SF;
  const role = SLOT_FACTOR[slot] ?? 0.30;

  // Seeded talent factor — used when real stats are absent
  const seed = (teamId * 31337 + slot * 1337) >>> 0;
  const u1 = ((seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
  const u2 = ((u1  * 1664525 + 1013904223) & 0xffffffff) >>> 0;
  const talent = Math.max(0.5, Math.min(1.8,
    (u1 / 0xffffffff + u2 / 0xffffffff - 1) * 0.35 + 1.0));
  const sc = role * talent;

  // ── Use real stats when provided, otherwise fall back to archetype ──
  const hasReal = entry.pts !== undefined;

  const pts  = hasReal ? entry.pts!               : Math.max(0, arch.pts  * sc);
  const reb  = hasReal ? (entry.reb  ?? arch.reb  * role) : Math.max(0, arch.reb  * sc);
  const ast  = hasReal ? (entry.ast  ?? arch.ast  * role) : Math.max(0, arch.ast  * sc);
  const stl  = hasReal ? (entry.stl  ?? arch.stl  * role) : Math.max(0, arch.stl  * sc);
  const blk  = hasReal ? (entry.blk  ?? arch.blk  * role) : Math.max(0, arch.blk  * sc);
  const min  = hasReal ? (entry.min  ?? arch.min  * role) : Math.max(1, arch.min  * sc);

  const fgPct  = entry.fgPct  ?? (hasReal ? arch.fgPct  : Math.min(0.70, Math.max(0.30, arch.fgPct  + (talent-1)*0.04)));
  const fg3Pct = entry.fg3Pct ?? (hasReal ? arch.fg3Pct : Math.min(0.50, Math.max(0.10, arch.fg3Pct + (talent-1)*0.04)));
  const ftPct  = entry.ftPct  ?? (hasReal ? arch.ftPct  : Math.min(0.95, Math.max(0.50, arch.ftPct  + (talent-1)*0.03)));

  // Derive attempt counts from real stats using archetype ratios
  const fga  = hasReal ? Math.max(1, pts * (arch.fga  / Math.max(arch.pts, 1)))  : Math.max(1, arch.fga  * sc);
  const fg3a = hasReal ? Math.max(0, fga * (arch.fg3a / Math.max(arch.fga, 1)))  : Math.max(0, arch.fg3a * sc);
  const fta  = hasReal ? Math.max(0, pts * (arch.fta  / Math.max(arch.pts, 1)))  : Math.max(0, arch.fta  * sc);
  const oreb = hasReal ? Math.max(0, reb * (arch.oreb / Math.max(arch.reb, 1)))  : Math.max(0, arch.oreb * sc);

  const turnover = hasReal ? Math.max(0, ast * 0.38) : Math.max(0, arch.to * sc);

  return {
    playerId:   stableId(entry.name),
    playerName: entry.name,
    position:   entry.pos,
    gamesPlayed: slot < 5 ? 65 + (seed % 17) : 45 + (seed % 25),
    minutesPg:  Math.max(1, min),
    pts,
    reb,
    ast,
    stl,
    blk,
    turnover,
    fgPct,
    fg3Pct,
    ftPct,
    fgm:  Math.max(0, fga  * fgPct),
    fga:  Math.max(1, fga),
    fg3m: Math.max(0, fg3a * fg3Pct),
    fg3a: Math.max(0, fg3a),
    ftm:  Math.max(0, fta  * ftPct),
    fta:  Math.max(0, fta),
    oreb: Math.max(0, oreb),
    dreb: Math.max(0, reb - oreb),
    pf:   2.5 * role,
  };
}

// ─── Synthetic fallback (generic names when no roster data exists) ─────────────

const ROSTER_TEMPLATE = [
  'PG','SG','SF','PF','C',
  'PG','SG','SF','PF','C',
  'G','F','F','C','G',
] as const;

export function buildSyntheticRoster(teamId: number, teamAbb: string): PlayerSeasonStats[] {
  return ROSTER_TEMPLATE.map((pos, slot) =>
    buildStatsForPlayer(teamId, slot, { name: `${teamAbb} ${pos}${slot + 1}`, pos })
  );
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function getTeamsWithRosters(year: number): Promise<{
  team: NBATeam & { wins: number; losses: number; winPct: number };
  players: PlayerSeasonStats[];
  winPct: number;
}[]> {
  const standings = await getStandings(year);

  return standings.map(team => {
    const rosterKey = findRosterKey(year, team.abbreviation);
    const namedPlayers = rosterKey ? rosters[String(year)][rosterKey] : null;

    const players = namedPlayers && namedPlayers.length > 0
      ? namedPlayers.slice(0, 15).map((p, slot) =>
          buildStatsForPlayer(team.id, slot, p)
        )
      : buildSyntheticRoster(team.id, team.abbreviation);

    return { team, players, winPct: team.winPct };
  });
}
