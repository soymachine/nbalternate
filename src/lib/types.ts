export interface NBATeam {
  id: number;
  name: string;
  abbreviation: string;
  city: string;
  conference: 'East' | 'West';
  division: string;
  fullName: string;
  wins?: number;
  losses?: number;
}

export interface NBAPlayer {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  teamId: number;
  teamAbbreviation: string;
}

export interface PlayerSeasonStats {
  playerId: number;
  playerName: string;
  position: string;
  gamesPlayed: number;
  minutesPg: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  pf: number;
}

export interface TeamWithRoster {
  team: NBATeam;
  players: PlayerSeasonStats[];
  winPct: number;           // season win%
  rawWinPct: number;        // same as winPct (kept for display)
  adjustedScore: number;    // winPct + randomFactor for seeding
  seed: number;
}

export interface PlayerGameStats {
  playerId: number;
  playerName: string;
  position: string;
  minutes: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  plusMinus: number;
}

export interface GameResult {
  gameNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeBoxScore: PlayerGameStats[];
  awayBoxScore: PlayerGameStats[];
  winner: string;
}

export interface SeriesResult {
  teamA: TeamWithRoster;
  teamB: TeamWithRoster;
  games: GameResult[];
  winner: TeamWithRoster;
  seriesScore: [number, number]; // [teamA wins, teamB wins]
  round: number;
  conference?: 'East' | 'West' | 'Finals';
  matchupId: string;
}

export interface PlayoffBracket {
  year: number;
  eastTeams: TeamWithRoster[];
  westTeams: TeamWithRoster[];
  // Round 1: Conference Quarterfinals
  eastR1: SeriesResult[];
  westR1: SeriesResult[];
  // Round 2: Conference Semifinals
  eastR2: SeriesResult[];
  westR2: SeriesResult[];
  // Round 3: Conference Finals
  eastFinal: SeriesResult;
  westFinal: SeriesResult;
  // NBA Finals
  nbaFinals: SeriesResult;
  champion: TeamWithRoster;
}
