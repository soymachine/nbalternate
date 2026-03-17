import type { PlayoffBracket, SeriesResult } from './types';

export interface FinalsMVP {
  playerId: number;
  playerName: string;
  position: string;
  teamAbb: string;
  teamId: number;
  gp: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  fg3Pct: number;
  mpg: number;
}

export interface PlayoffLeader {
  rank: number;
  playerId: number;
  playerName: string;
  position: string;
  teamAbb: string;
  teamFullName: string;
  gp: number;          // games played
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  mpg: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
}

interface Accumulator {
  playerName: string;
  position: string;
  teamAbb: string;
  teamFullName: string;
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  min: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
}

function allSeries(bracket: PlayoffBracket): SeriesResult[] {
  return [
    ...bracket.eastR1,
    ...bracket.westR1,
    ...bracket.eastR2,
    ...bracket.westR2,
    bracket.eastFinal,
    bracket.westFinal,
    bracket.nbaFinals,
  ];
}

// Build a playerId → team lookup from bracket teams
function buildTeamMap(bracket: PlayoffBracket): Map<number, { abb: string; full: string }> {
  const map = new Map<number, { abb: string; full: string }>();
  for (const tw of [...bracket.eastTeams, ...bracket.westTeams]) {
    for (const p of tw.players) {
      map.set(p.playerId, {
        abb: tw.team.abbreviation,
        full: tw.team.fullName,
      });
    }
  }
  return map;
}

export function buildLeaderboard(bracket: PlayoffBracket): PlayoffLeader[] {
  const acc = new Map<number, Accumulator>();
  const teamMap = buildTeamMap(bracket);

  for (const series of allSeries(bracket)) {
    for (const game of series.games) {
      for (const p of [...game.homeBoxScore, ...game.awayBoxScore]) {
        if (p.minutes === 0) continue;

        const existing = acc.get(p.playerId);
        const team = teamMap.get(p.playerId) ?? { abb: '???', full: 'Unknown' };

        if (existing) {
          existing.gp   += 1;
          existing.pts  += p.pts;
          existing.reb  += p.reb;
          existing.ast  += p.ast;
          existing.stl  += p.stl;
          existing.blk  += p.blk;
          existing.min  += p.minutes;
          existing.fgm  += p.fgm;
          existing.fga  += p.fga;
          existing.fg3m += p.fg3m;
          existing.fg3a += p.fg3a;
          existing.ftm  += p.ftm;
          existing.fta  += p.fta;
        } else {
          acc.set(p.playerId, {
            playerName:   p.playerName,
            position:     p.position,
            teamAbb:      team.abb,
            teamFullName: team.full,
            gp:   1,
            pts:  p.pts,  reb:  p.reb,  ast: p.ast,
            stl:  p.stl,  blk:  p.blk,  min: p.minutes,
            fgm:  p.fgm,  fga:  p.fga,
            fg3m: p.fg3m, fg3a: p.fg3a,
            ftm:  p.ftm,  fta:  p.fta,
          });
        }
      }
    }
  }

  const leaders: PlayoffLeader[] = [];
  for (const [id, a] of acc.entries()) {
    if (a.gp < 2) continue; // need at least 2 games to qualify
    const gp = a.gp;
    leaders.push({
      rank: 0,
      playerId:     id,
      playerName:   a.playerName,
      position:     a.position,
      teamAbb:      a.teamAbb,
      teamFullName: a.teamFullName,
      gp,
      ppg:   round1(a.pts  / gp),
      rpg:   round1(a.reb  / gp),
      apg:   round1(a.ast  / gp),
      spg:   round1(a.stl  / gp),
      bpg:   round1(a.blk  / gp),
      mpg:   round1(a.min  / gp),
      fgPct:  a.fga  > 0 ? round3(a.fgm  / a.fga)  : 0,
      fg3Pct: a.fg3a > 0 ? round3(a.fg3m / a.fg3a) : 0,
      ftPct:  a.fta  > 0 ? round3(a.ftm  / a.fta)  : 0,
    });
  }

  return leaders;
}

function round1(n: number) { return Math.round(n * 10) / 10; }
function round3(n: number) { return Math.round(n * 1000) / 1000; }

export function getFinalsMVP(bracket: PlayoffBracket): FinalsMVP | null {
  const series = bracket.nbaFinals;

  // Map each player ID to their team (from both finalists' rosters)
  const playerTeam = new Map<number, { abb: string; id: number }>();
  for (const p of series.teamA.players)
    playerTeam.set(p.playerId, { abb: series.teamA.team.abbreviation, id: series.teamA.team.id });
  for (const p of series.teamB.players)
    playerTeam.set(p.playerId, { abb: series.teamB.team.abbreviation, id: series.teamB.team.id });

  type Acc = {
    playerName: string; position: string; teamAbb: string; teamId: number;
    gp: number; pts: number; reb: number; ast: number; stl: number; blk: number;
    min: number; fgm: number; fga: number; fg3m: number; fg3a: number; ftm: number; fta: number;
  };

  const acc = new Map<number, Acc>();

  for (const game of series.games) {
    for (const p of [...game.homeBoxScore, ...game.awayBoxScore]) {
      if (p.minutes === 0) continue;
      const team = playerTeam.get(p.playerId) ?? { abb: '???', id: 0 };
      const a = acc.get(p.playerId);
      if (a) {
        a.gp += 1; a.pts += p.pts; a.reb += p.reb; a.ast += p.ast;
        a.stl += p.stl; a.blk += p.blk; a.min += p.minutes;
        a.fgm += p.fgm; a.fga += p.fga; a.fg3m += p.fg3m; a.fg3a += p.fg3a;
        a.ftm += p.ftm; a.fta += p.fta;
      } else {
        acc.set(p.playerId, {
          playerName: p.playerName, position: p.position,
          teamAbb: team.abb, teamId: team.id,
          gp: 1, pts: p.pts, reb: p.reb, ast: p.ast, stl: p.stl, blk: p.blk,
          min: p.minutes, fgm: p.fgm, fga: p.fga, fg3m: p.fg3m, fg3a: p.fg3a,
          ftm: p.ftm, fta: p.fta,
        });
      }
    }
  }

  let bestId = -1;
  let bestScore = -Infinity;

  for (const [id, a] of acc.entries()) {
    const gp = a.gp;
    // Composite: heavily scoring-weighted but all-around rewarded
    const composite = (a.pts / gp) + (a.reb / gp) * 1.2 + (a.ast / gp) * 1.5
      + (a.stl / gp) * 3 + (a.blk / gp) * 2;
    if (composite > bestScore) { bestScore = composite; bestId = id; }
  }

  if (bestId === -1) return null;
  const a = acc.get(bestId)!;
  const gp = a.gp;
  return {
    playerId: bestId,
    playerName: a.playerName,
    position: a.position,
    teamAbb: a.teamAbb,
    teamId: a.teamId,
    gp,
    ppg:   round1(a.pts  / gp),
    rpg:   round1(a.reb  / gp),
    apg:   round1(a.ast  / gp),
    spg:   round1(a.stl  / gp),
    bpg:   round1(a.blk  / gp),
    fgPct:  a.fga  > 0 ? round3(a.fgm  / a.fga)  : 0,
    fg3Pct: a.fg3a > 0 ? round3(a.fg3m / a.fg3a) : 0,
    mpg:   round1(a.min  / gp),
  };
}

export function topBy(
  leaders: PlayoffLeader[],
  key: keyof PlayoffLeader,
  n = 15,
): PlayoffLeader[] {
  return [...leaders]
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, n)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
