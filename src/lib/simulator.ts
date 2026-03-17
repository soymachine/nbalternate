import type {
  TeamWithRoster,
  PlayerSeasonStats,
  PlayerGameStats,
  GameResult,
  SeriesResult,
  PlayoffBracket,
} from './types';

// Seeded pseudo-random (for determinism per bracket generation)
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return ((this.seed >>> 0) / 0xffffffff);
  }
  between(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  normal(mean: number, stdDev: number): number {
    // Box-Muller
    const u1 = Math.max(this.next(), 1e-10);
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

function getTeamStrength(team: TeamWithRoster): number {
  return team.adjustedScore;
}

function simulatePlayerGame(
  player: PlayerSeasonStats,
  rng: SeededRandom,
  minuteFactor = 1.0
): PlayerGameStats {
  const minuteVariance = rng.normal(1.0, 0.15);
  const minutes = Math.max(0, Math.round(player.minutesPg * minuteFactor * minuteVariance));

  if (minutes === 0) {
    return {
      playerId: player.playerId,
      playerName: player.playerName,
      position: player.position,
      minutes: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, turnover: 0,
      fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, plusMinus: 0,
    };
  }

  const performanceFactor = rng.normal(1.0, 0.20); // game-to-game variance

  // Field goal attempts scale with minutes
  const minuteRatio = minutes / Math.max(player.minutesPg, 1);
  const fga = Math.max(0, Math.round(rng.normal(player.fga * minuteRatio * performanceFactor, 1.5)));
  const fg3a = Math.max(0, Math.round(rng.normal(player.fg3a * minuteRatio * performanceFactor, 0.8)));
  const fta = Math.max(0, Math.round(rng.normal(player.fta * minuteRatio * performanceFactor, 1)));

  // Make rates with slight variance around season averages
  const fgPct = Math.max(0, Math.min(1, rng.normal(player.fgPct, 0.08)));
  const fg3Pct = Math.max(0, Math.min(1, rng.normal(player.fg3Pct, 0.10)));
  const ftPct = Math.max(0, Math.min(1, rng.normal(player.ftPct, 0.07)));

  const fg3m = Math.min(Math.round(fg3a * fg3Pct), fg3a);
  const fgm = Math.min(Math.round(fga * fgPct), fga);
  const ftm = Math.min(Math.round(fta * ftPct), fta);

  // Points: 2-pt buckets + 3-pt buckets + FT
  const pts = (fgm - fg3m) * 2 + fg3m * 3 + ftm;

  const reb = Math.max(0, Math.round(rng.normal(player.reb * minuteRatio * performanceFactor, 1.2)));
  const ast = Math.max(0, Math.round(rng.normal(player.ast * minuteRatio * performanceFactor, 1)));
  const stl = Math.max(0, Math.round(rng.normal(player.stl * minuteRatio * performanceFactor, 0.5)));
  const blk = Math.max(0, Math.round(rng.normal(player.blk * minuteRatio * performanceFactor, 0.4)));
  const turnover = Math.max(0, Math.round(rng.normal(player.turnover * minuteRatio * performanceFactor, 0.6)));

  return {
    playerId: player.playerId,
    playerName: player.playerName,
    position: player.position,
    minutes,
    pts,
    reb,
    ast,
    stl,
    blk,
    turnover,
    fgm,
    fga,
    fg3m,
    fg3a,
    ftm,
    fta,
    plusMinus: 0, // filled in after
  };
}

function simulateGame(
  homeTeam: TeamWithRoster,
  awayTeam: TeamWithRoster,
  gameNumber: number,
  rng: SeededRandom
): GameResult {
  // Simulate home and away box scores
  const homePlayers = homeTeam.players.filter(p => p.gamesPlayed > 0).slice(0, 12);
  const awayPlayers = awayTeam.players.filter(p => p.gamesPlayed > 0).slice(0, 12);

  // Home court advantage: +2-3 points
  const homeAdvantage = rng.between(1.5, 3.5);

  const homeBoxScore: PlayerGameStats[] = homePlayers.map(p =>
    simulatePlayerGame(p, rng)
  );
  const awayBoxScore: PlayerGameStats[] = awayPlayers.map(p =>
    simulatePlayerGame(p, rng)
  );

  const homeRaw = homeBoxScore.reduce((s, p) => s + p.pts, 0);
  const awayRaw = awayBoxScore.reduce((s, p) => s + p.pts, 0);

  // Blend with team strength to avoid pure stat-driven results
  const homeStrength = getTeamStrength(homeTeam);
  const awayStrength = getTeamStrength(awayTeam);

  // Expected score around 105, adjusted by team strength and home advantage
  const avgScore = 105;
  const strengthDiff = (homeStrength - awayStrength) * 10; // up to ±5 pts

  // Scale raw box score to realistic range
  const targetHome = avgScore + strengthDiff / 2 + homeAdvantage;
  const targetAway = avgScore - strengthDiff / 2;

  const homeScale = homeRaw > 0 ? targetHome / homeRaw : 1;
  const awayScale = awayRaw > 0 ? targetAway / awayRaw : 1;

  let homeScore = Math.round(homeRaw * homeScale + rng.normal(0, 5));
  let awayScore = Math.round(awayRaw * awayScale + rng.normal(0, 5));

  homeScore = Math.max(85, homeScore);
  awayScore = Math.max(85, awayScore);

  // Avoid ties
  if (homeScore === awayScore) homeScore += 1;

  // Scale player pts proportionally
  const homeScoreScale = homeScore / Math.max(homeBoxScore.reduce((s, p) => s + p.pts, 0), 1);
  const awayScoreScale = awayScore / Math.max(awayBoxScore.reduce((s, p) => s + p.pts, 0), 1);

  const winner = homeScore > awayScore ? homeTeam.team.abbreviation : awayTeam.team.abbreviation;
  const homeDiff = homeScore - awayScore;

  // Apply plusMinus
  homeBoxScore.forEach(p => {
    p.pts = Math.round(p.pts * homeScoreScale);
    p.plusMinus = Math.round(rng.normal(homeDiff / homePlayers.length, 6));
  });
  awayBoxScore.forEach(p => {
    p.pts = Math.round(p.pts * awayScoreScale);
    p.plusMinus = Math.round(rng.normal(-homeDiff / awayPlayers.length, 6));
  });

  return {
    gameNumber,
    homeTeam: homeTeam.team.abbreviation,
    awayTeam: awayTeam.team.abbreviation,
    homeScore,
    awayScore,
    homeBoxScore,
    awayBoxScore,
    winner,
  };
}

function simulateSeries(
  teamA: TeamWithRoster, // higher seed (home in odd games)
  teamB: TeamWithRoster,
  round: number,
  conference: 'East' | 'West' | 'Finals',
  rng: SeededRandom
): SeriesResult {
  const matchupId = `${conference}-R${round}-${teamA.team.abbreviation}v${teamB.team.abbreviation}`;
  const games: GameResult[] = [];
  let aWins = 0;
  let bWins = 0;
  let gameNum = 1;

  // Home schedule for best-of-7: A,A,B,B,A,B,A
  const homeTeamMap = [teamA, teamA, teamB, teamB, teamA, teamB, teamA];

  while (aWins < 4 && bWins < 4) {
    const homeIsA = homeTeamMap[gameNum - 1] === teamA;
    const home = homeIsA ? teamA : teamB;
    const away = homeIsA ? teamB : teamA;

    const game = simulateGame(home, away, gameNum, rng);
    games.push(game);

    if (game.winner === teamA.team.abbreviation) aWins++;
    else bWins++;

    gameNum++;
  }

  const winner = aWins === 4 ? teamA : teamB;

  return {
    teamA,
    teamB,
    games,
    winner,
    seriesScore: [aWins, bWins],
    round,
    conference,
    matchupId,
  };
}

export function simulateBracket(
  eastTeams: TeamWithRoster[],
  westTeams: TeamWithRoster[],
  year: number
): PlayoffBracket {
  const rng = new SeededRandom(year * 31337 + Date.now() % 10000);

  // Seeds 1-8 for each conference (already sorted by adjustedScore desc)
  const east = eastTeams.slice(0, 8);
  const west = westTeams.slice(0, 8);

  // Assign seeds
  east.forEach((t, i) => { t.seed = i + 1; });
  west.forEach((t, i) => { t.seed = i + 1; });

  // Round 1: 1v8, 2v7, 3v6, 4v5
  const eastR1 = [
    simulateSeries(east[0], east[7], 1, 'East', rng),
    simulateSeries(east[1], east[6], 1, 'East', rng),
    simulateSeries(east[2], east[5], 1, 'East', rng),
    simulateSeries(east[3], east[4], 1, 'East', rng),
  ];
  const westR1 = [
    simulateSeries(west[0], west[7], 1, 'West', rng),
    simulateSeries(west[1], west[6], 1, 'West', rng),
    simulateSeries(west[2], west[5], 1, 'West', rng),
    simulateSeries(west[3], west[4], 1, 'West', rng),
  ];

  // Round 2
  const eastR2 = [
    simulateSeries(eastR1[0].winner, eastR1[3].winner, 2, 'East', rng),
    simulateSeries(eastR1[1].winner, eastR1[2].winner, 2, 'East', rng),
  ];
  const westR2 = [
    simulateSeries(westR1[0].winner, westR1[3].winner, 2, 'West', rng),
    simulateSeries(westR1[1].winner, westR1[2].winner, 2, 'West', rng),
  ];

  // Conference Finals
  const eastFinal = simulateSeries(eastR2[0].winner, eastR2[1].winner, 3, 'East', rng);
  const westFinal = simulateSeries(westR2[0].winner, westR2[1].winner, 3, 'West', rng);

  // NBA Finals
  const nbaFinals = simulateSeries(eastFinal.winner, westFinal.winner, 4, 'Finals', rng);

  return {
    year,
    eastTeams: east,
    westTeams: west,
    eastR1,
    westR1,
    eastR2,
    westR2,
    eastFinal,
    westFinal,
    nbaFinals,
    champion: nbaFinals.winner,
  };
}

export function applyRandomJitter(winPct: number, rng: SeededRandom): number {
  const jitter = rng.normal(0, 0.08); // ±8% std dev
  return Math.max(0, Math.min(1, winPct + jitter));
}

export function selectPlayoffTeams(
  teams: TeamWithRoster[],
  year: number
): { east: TeamWithRoster[]; west: TeamWithRoster[] } {
  const rng = new SeededRandom(year * 12345);

  const east = teams
    .filter(t => t.team.conference === 'East')
    .map(t => ({ ...t, adjustedScore: applyRandomJitter(t.winPct, rng) }))
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, 8);

  const west = teams
    .filter(t => t.team.conference === 'West')
    .map(t => ({ ...t, adjustedScore: applyRandomJitter(t.winPct, rng) }))
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, 8);

  return { east, west };
}
