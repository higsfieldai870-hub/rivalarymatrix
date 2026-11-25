// Seasons the BSD API doesn't cover. BSD's career data starts in 2011/12,
// so for players whose careers began earlier, the missing seasons are entered
// here by hand from a published source and merged into their dossier
// (lib/bsd/players.ts, `withHistory`). For Messi and Ronaldo, BSD also misses
// matches after 2011/12, so their whole careers come from one source instead
// (./messi-ronaldo.ts, `complete`).
//
// One row per season, team and competition, using the figures exactly as the
// source shows them. Only appearances, minutes, goals and assists are stored;
// nothing more detailed exists per match for these years.
//
// Rules:
// - `season` is the year the season starts: 2004 for 2004/05. A national
//   team tournament uses its year (2006 for the 2006 World Cup); friendlies
//   and qualifiers in a calendar year use that year.
// - Only enter seasons before BSD's coverage. Where BSD already has a row for
//   the same season and competition, BSD's row wins and this one is skipped.
// - `competition` should use BSD's name where one exists ("Champions League",
//   "LaLiga", "Premier League"...), so rows group with BSD's in the
//   competition breakdown and in the Champions League filter.
// - Never estimate. Leave a season out rather than guess a number.

import { messiRows, ronaldoRows } from "./messi-ronaldo";

export type HistoricalRow = {
  season: number;
  team: string;
  competition: string;
  national?: boolean;
  apps: number;
  minutes: number;
  goals: number;
  assists: number;
};

export type HistoricalPlayer = {
  // Matched against the BSD profile: same birth date, and the last name
  // appears in BSD's name for the player.
  lastName: string;
  birthDate: string;
  source: string;
  // true: `rows` are the player's whole career, and they replace BSD's
  // appearances, minutes, goals and assists everywhere. BSD's rows are then
  // kept only for detailed stats and ratings. Otherwise `rows` only fill in
  // seasons BSD doesn't have.
  complete?: boolean;
  rows: HistoricalRow[];
};

export const historicalPlayers: HistoricalPlayer[] = [
  {
    lastName: "Messi",
    birthDate: "1987-06-24",
    source: "messivsronaldo.app",
    complete: true,
    rows: messiRows,
  },
  {
    lastName: "Ronaldo",
    birthDate: "1985-02-05",
    source: "messivsronaldo.app",
    complete: true,
    rows: ronaldoRows,
  },
  {
    lastName: "Lewandowski",
    birthDate: "1988-08-21",
    source: "Transfermarkt",
    // Znicz Pruszków 2007/08, Lech Poznań 2008/09 and 2009/10, Borussia
    // Dortmund 2010/11, from Transfermarkt's detailed stats
    // (transfermarkt.com/robert-lewandowski/leistungsdatendetails/spieler/38253).
    // Not yet included: Znicz 2006/07 (third tier), which that table doesn't
    // list, and Poland before 2011. Totals: 71 goals in 2007/08-2010/11.
    rows: [
      { season: 2010, team: "Borussia Dortmund", competition: "Bundesliga", apps: 33, minutes: 1581, goals: 8, assists: 3 },
      { season: 2010, team: "Borussia Dortmund", competition: "UEFA Europa League", apps: 6, minutes: 199, goals: 1, assists: 1 },
      { season: 2010, team: "Borussia Dortmund", competition: "UEFA Europa League Qualifying", apps: 2, minutes: 49, goals: 0, assists: 0 },
      { season: 2010, team: "Borussia Dortmund", competition: "DFB-Pokal", apps: 2, minutes: 154, goals: 0, assists: 0 },

      { season: 2009, team: "Lech Poznań", competition: "Ekstraklasa", apps: 28, minutes: 2520, goals: 18, assists: 8 },
      { season: 2009, team: "Lech Poznań", competition: "UEFA Europa League Qualifying", apps: 4, minutes: 367, goals: 2, assists: 0 },
      { season: 2009, team: "Lech Poznań", competition: "Puchar Polski", apps: 1, minutes: 120, goals: 0, assists: 0 },
      { season: 2009, team: "Lech Poznań", competition: "Superpuchar Polski", apps: 1, minutes: 120, goals: 1, assists: 0 },

      { season: 2008, team: "Lech Poznań", competition: "Ekstraklasa", apps: 30, minutes: 2437, goals: 14, assists: 6 },
      { season: 2008, team: "Lech Poznań", competition: "UEFA Cup", apps: 8, minutes: 592, goals: 1, assists: 2 },
      { season: 2008, team: "Lech Poznań", competition: "UEFA Cup Qualifying", apps: 4, minutes: 180, goals: 3, assists: 1 },
      { season: 2008, team: "Lech Poznań", competition: "Puchar Polski", apps: 6, minutes: 522, goals: 2, assists: 2 },

      // Poland's second tier, then called II liga.
      { season: 2007, team: "Znicz Pruszków", competition: "II liga", apps: 32, minutes: 2707, goals: 21, assists: 1 },
    ],
  },
  {
    lastName: "Modrić",
    birthDate: "1985-09-09",
    source: "Transfermarkt",
    // Dinamo Zagreb 2005/06 to 2007/08 and Tottenham 2008/09 to 2010/11, from
    // Transfermarkt's detailed stats
    // (transfermarkt.com/luka-modric/leistungsdatendetails/spieler/27992).
    // Not yet included: the Zrinjski Mostar and Inter Zaprešić loans
    // (2003/04, 2004/05), which that table lists without clubs and only in
    // part, and Croatia before 2011. Totals: 44 goals in 2005/06-2010/11.
    rows: [
      { season: 2010, team: "Tottenham Hotspur", competition: "Premier League", apps: 32, minutes: 2798, goals: 3, assists: 1 },
      { season: 2010, team: "Tottenham Hotspur", competition: "UEFA Champions League", apps: 8, minutes: 563, goals: 1, assists: 1 },
      { season: 2010, team: "Tottenham Hotspur", competition: "UEFA Champions League Qualifying", apps: 1, minutes: 45, goals: 0, assists: 0 },
      { season: 2010, team: "Tottenham Hotspur", competition: "FA Cup", apps: 2, minutes: 135, goals: 0, assists: 0 },

      { season: 2009, team: "Tottenham Hotspur", competition: "Premier League", apps: 25, minutes: 1913, goals: 3, assists: 4 },
      { season: 2009, team: "Tottenham Hotspur", competition: "FA Cup", apps: 7, minutes: 633, goals: 0, assists: 3 },

      { season: 2008, team: "Tottenham Hotspur", competition: "Premier League", apps: 34, minutes: 2784, goals: 3, assists: 9 },
      { season: 2008, team: "Tottenham Hotspur", competition: "UEFA Cup", apps: 4, minutes: 287, goals: 1, assists: 1 },
      { season: 2008, team: "Tottenham Hotspur", competition: "League Cup", apps: 4, minutes: 290, goals: 0, assists: 1 },
      { season: 2008, team: "Tottenham Hotspur", competition: "FA Cup", apps: 2, minutes: 135, goals: 1, assists: 0 },

      { season: 2007, team: "Dinamo Zagreb", competition: "HNL", apps: 25, minutes: 1984, goals: 13, assists: 11 },
      { season: 2007, team: "Dinamo Zagreb", competition: "UEFA Cup", apps: 6, minutes: 570, goals: 1, assists: 0 },
      { season: 2007, team: "Dinamo Zagreb", competition: "UEFA Champions League Qualifying", apps: 6, minutes: 570, goals: 2, assists: 0 },
      { season: 2007, team: "Dinamo Zagreb", competition: "Croatian Cup", apps: 3, minutes: 224, goals: 0, assists: 0 },

      { season: 2006, team: "Dinamo Zagreb", competition: "HNL", apps: 30, minutes: 2523, goals: 6, assists: 10 },
      { season: 2006, team: "Dinamo Zagreb", competition: "UEFA Cup", apps: 2, minutes: 180, goals: 0, assists: 0 },
      { season: 2006, team: "Dinamo Zagreb", competition: "UEFA Champions League Qualifying", apps: 4, minutes: 335, goals: 0, assists: 0 },
      { season: 2006, team: "Dinamo Zagreb", competition: "Croatian Cup", apps: 3, minutes: 270, goals: 1, assists: 0 },
      { season: 2006, team: "Dinamo Zagreb", competition: "Croatian Super Cup", apps: 1, minutes: 90, goals: 1, assists: 0 },

      { season: 2005, team: "Dinamo Zagreb", competition: "HNL", apps: 31, minutes: 2521, goals: 8, assists: 0 },
    ],
  },
];
