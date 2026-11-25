// Seasons the BSD API doesn't cover. BSD's career data starts in 2011/12,
// so for players whose careers began earlier, the missing seasons are entered
// here by hand from a published source and merged into their dossier
// (lib/bsd/players.ts, `withHistory`).
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
  rows: HistoricalRow[];
};

export const historicalPlayers: HistoricalPlayer[] = [
  {
    lastName: "Messi",
    birthDate: "1987-06-24",
    source: "Transfermarkt",
    // Barcelona first team 2004/05 to 2010/11, from Transfermarkt's detailed
    // stats (transfermarkt.com/lionel-messi/leistungsdatendetails/spieler/28003).
    // Barcelona B (Segunda B) is left out, as in official Barcelona tallies.
    // Totals: 180 goals in 2004/05-2010/11.
    rows: [
      { season: 2010, team: "Barcelona", competition: "LaLiga", apps: 33, minutes: 2861, goals: 31, assists: 21 },
      { season: 2010, team: "Barcelona", competition: "UEFA Champions League", apps: 13, minutes: 1048, goals: 12, assists: 4 },
      { season: 2010, team: "Barcelona", competition: "Copa del Rey", apps: 7, minutes: 542, goals: 7, assists: 2 },
      { season: 2010, team: "Barcelona", competition: "Supercopa de España", apps: 2, minutes: 128, goals: 3, assists: 0 },

      { season: 2009, team: "Barcelona", competition: "LaLiga", apps: 35, minutes: 2840, goals: 34, assists: 11 },
      { season: 2009, team: "Barcelona", competition: "UEFA Champions League", apps: 11, minutes: 986, goals: 8, assists: 0 },
      { season: 2009, team: "Barcelona", competition: "Copa del Rey", apps: 3, minutes: 209, goals: 1, assists: 0 },
      { season: 2009, team: "Barcelona", competition: "FIFA Club World Cup", apps: 2, minutes: 157, goals: 2, assists: 0 },
      { season: 2009, team: "Barcelona", competition: "UEFA Super Cup", apps: 1, minutes: 120, goals: 0, assists: 1 },
      { season: 2009, team: "Barcelona", competition: "Supercopa de España", apps: 1, minutes: 90, goals: 2, assists: 0 },

      { season: 2008, team: "Barcelona", competition: "LaLiga", apps: 31, minutes: 2513, goals: 23, assists: 13 },
      { season: 2008, team: "Barcelona", competition: "UEFA Champions League", apps: 12, minutes: 927, goals: 9, assists: 5 },
      { season: 2008, team: "Barcelona", competition: "Copa del Rey", apps: 8, minutes: 450, goals: 6, assists: 1 },

      { season: 2007, team: "Barcelona", competition: "LaLiga", apps: 28, minutes: 2003, goals: 10, assists: 14 },
      { season: 2007, team: "Barcelona", competition: "UEFA Champions League", apps: 9, minutes: 726, goals: 6, assists: 2 },
      { season: 2007, team: "Barcelona", competition: "Copa del Rey", apps: 3, minutes: 225, goals: 0, assists: 0 },

      { season: 2006, team: "Barcelona", competition: "LaLiga", apps: 26, minutes: 2001, goals: 14, assists: 2 },
      { season: 2006, team: "Barcelona", competition: "UEFA Champions League", apps: 5, minutes: 385, goals: 1, assists: 0 },
      { season: 2006, team: "Barcelona", competition: "Copa del Rey", apps: 2, minutes: 166, goals: 2, assists: 1 },
      { season: 2006, team: "Barcelona", competition: "UEFA Super Cup", apps: 1, minutes: 90, goals: 0, assists: 0 },
      { season: 2006, team: "Barcelona", competition: "Supercopa de España", apps: 2, minutes: 121, goals: 0, assists: 0 },

      { season: 2005, team: "Barcelona", competition: "LaLiga", apps: 17, minutes: 912, goals: 6, assists: 2 },
      { season: 2005, team: "Barcelona", competition: "UEFA Champions League", apps: 6, minutes: 322, goals: 1, assists: 2 },
      { season: 2005, team: "Barcelona", competition: "Copa del Rey", apps: 2, minutes: 180, goals: 1, assists: 1 },

      { season: 2004, team: "Barcelona", competition: "LaLiga", apps: 7, minutes: 76, goals: 1, assists: 0 },
      { season: 2004, team: "Barcelona", competition: "UEFA Champions League", apps: 1, minutes: 90, goals: 0, assists: 0 },
      { season: 2004, team: "Barcelona", competition: "Copa del Rey", apps: 1, minutes: 73, goals: 0, assists: 0 },

      // Argentina, debut (Aug 2005) to the 2011 Copa América, from
      // Transfermarkt's match list (transfermarkt.com/lionel-messi/
      // nationalmannschaft/spieler/28003/verein_id/3437), goals checked against
      // Wikipedia's list of his international goals. Season = calendar year.
      // 17 goals, Croatia (Mar 2006) to Albania (Jun 2011).
      { season: 2011, team: "Argentina", competition: "International Friendlies", national: true, apps: 3, minutes: 270, goals: 2, assists: 3 },
      { season: 2011, team: "Argentina", competition: "Copa América", national: true, apps: 4, minutes: 390, goals: 0, assists: 3 },
      { season: 2010, team: "Argentina", competition: "International Friendlies", national: true, apps: 5, minutes: 414, goals: 2, assists: 0 },
      { season: 2010, team: "Argentina", competition: "FIFA World Cup", national: true, apps: 5, minutes: 450, goals: 0, assists: 1 },
      { season: 2009, team: "Argentina", competition: "International Friendlies", national: true, apps: 2, minutes: 174, goals: 2, assists: 0 },
      { season: 2009, team: "Argentina", competition: "World Cup Qualification", national: true, apps: 8, minutes: 716, goals: 1, assists: 1 },
      { season: 2008, team: "Argentina", competition: "International Friendlies", national: true, apps: 2, minutes: 130, goals: 1, assists: 1 },
      { season: 2008, team: "Argentina", competition: "World Cup Qualification", national: true, apps: 6, minutes: 539, goals: 1, assists: 1 },
      { season: 2007, team: "Argentina", competition: "International Friendlies", national: true, apps: 4, minutes: 357, goals: 2, assists: 2 },
      { season: 2007, team: "Argentina", competition: "Copa América", national: true, apps: 6, minutes: 457, goals: 2, assists: 1 },
      { season: 2007, team: "Argentina", competition: "World Cup Qualification", national: true, apps: 4, minutes: 354, goals: 2, assists: 1 },
      { season: 2006, team: "Argentina", competition: "International Friendlies", national: true, apps: 4, minutes: 263, goals: 1, assists: 1 },
      { season: 2006, team: "Argentina", competition: "FIFA World Cup", national: true, apps: 3, minutes: 122, goals: 1, assists: 1 },
      { season: 2005, team: "Argentina", competition: "International Friendlies", national: true, apps: 2, minutes: 82, goals: 0, assists: 1 },
      { season: 2005, team: "Argentina", competition: "World Cup Qualification", national: true, apps: 3, minutes: 125, goals: 0, assists: 1 },
    ],
  },
  {
    lastName: "Ronaldo",
    birthDate: "1985-02-05",
    source: "Transfermarkt",
    // Sporting 2002/03, Manchester United 2003/04 to 2008/09, Real Madrid
    // 2009/10 and 2010/11, from Transfermarkt's detailed stats
    // (transfermarkt.com/cristiano-ronaldo/leistungsdatendetails/spieler/8198).
    // Totals: 209 goals in 2002/03-2010/11.
    rows: [
      { season: 2010, team: "Real Madrid", competition: "LaLiga", apps: 34, minutes: 2913, goals: 40, assists: 13 },
      { season: 2010, team: "Real Madrid", competition: "UEFA Champions League", apps: 12, minutes: 1021, goals: 6, assists: 4 },
      { season: 2010, team: "Real Madrid", competition: "Copa del Rey", apps: 8, minutes: 684, goals: 7, assists: 1 },

      { season: 2009, team: "Real Madrid", competition: "LaLiga", apps: 29, minutes: 2465, goals: 26, assists: 9 },
      { season: 2009, team: "Real Madrid", competition: "UEFA Champions League", apps: 6, minutes: 450, goals: 7, assists: 1 },

      { season: 2008, team: "Manchester United", competition: "Premier League", apps: 33, minutes: 2745, goals: 18, assists: 7 },
      { season: 2008, team: "Manchester United", competition: "UEFA Champions League", apps: 12, minutes: 1010, goals: 4, assists: 3 },
      { season: 2008, team: "Manchester United", competition: "FA Cup", apps: 2, minutes: 144, goals: 1, assists: 1 },
      { season: 2008, team: "Manchester United", competition: "League Cup", apps: 4, minutes: 240, goals: 2, assists: 0 },
      { season: 2008, team: "Manchester United", competition: "FIFA Club World Cup", apps: 2, minutes: 180, goals: 1, assists: 1 },

      { season: 2007, team: "Manchester United", competition: "Premier League", apps: 34, minutes: 2747, goals: 31, assists: 7 },
      { season: 2007, team: "Manchester United", competition: "UEFA Champions League", apps: 11, minutes: 1017, goals: 8, assists: 2 },
      { season: 2007, team: "Manchester United", competition: "FA Cup", apps: 3, minutes: 270, goals: 3, assists: 0 },
      { season: 2007, team: "Manchester United", competition: "Community Shield", apps: 1, minutes: 120, goals: 0, assists: 0 },

      { season: 2006, team: "Manchester United", competition: "Premier League", apps: 34, minutes: 2788, goals: 17, assists: 15 },
      { season: 2006, team: "Manchester United", competition: "UEFA Champions League", apps: 11, minutes: 951, goals: 3, assists: 5 },
      { season: 2006, team: "Manchester United", competition: "FA Cup", apps: 7, minutes: 558, goals: 3, assists: 1 },
      { season: 2006, team: "Manchester United", competition: "League Cup", apps: 1, minutes: 90, goals: 0, assists: 0 },

      { season: 2005, team: "Manchester United", competition: "Premier League", apps: 33, minutes: 2284, goals: 9, assists: 6 },
      { season: 2005, team: "Manchester United", competition: "UEFA Champions League", apps: 6, minutes: 506, goals: 0, assists: 0 },
      { season: 2005, team: "Manchester United", competition: "UEFA Champions League Qualifying", apps: 2, minutes: 157, goals: 1, assists: 1 },
      { season: 2005, team: "Manchester United", competition: "League Cup", apps: 4, minutes: 343, goals: 2, assists: 1 },
      { season: 2005, team: "Manchester United", competition: "FA Cup", apps: 2, minutes: 121, goals: 0, assists: 0 },

      { season: 2004, team: "Manchester United", competition: "Premier League", apps: 33, minutes: 2423, goals: 5, assists: 5 },
      { season: 2004, team: "Manchester United", competition: "UEFA Champions League", apps: 7, minutes: 502, goals: 0, assists: 2 },
      { season: 2004, team: "Manchester United", competition: "UEFA Champions League Qualifying", apps: 1, minutes: 64, goals: 0, assists: 0 },
      { season: 2004, team: "Manchester United", competition: "FA Cup", apps: 7, minutes: 545, goals: 4, assists: 3 },
      { season: 2004, team: "Manchester United", competition: "League Cup", apps: 2, minutes: 180, goals: 0, assists: 0 },

      { season: 2003, team: "Manchester United", competition: "Premier League", apps: 29, minutes: 1551, goals: 4, assists: 4 },
      { season: 2003, team: "Manchester United", competition: "UEFA Champions League", apps: 5, minutes: 291, goals: 0, assists: 1 },
      { season: 2003, team: "Manchester United", competition: "FA Cup", apps: 5, minutes: 436, goals: 2, assists: 3 },
      { season: 2003, team: "Manchester United", competition: "League Cup", apps: 1, minutes: 77, goals: 0, assists: 0 },

      { season: 2002, team: "Sporting CP", competition: "Primeira Liga", apps: 25, minutes: 1069, goals: 3, assists: 5 },
      { season: 2002, team: "Sporting CP", competition: "Taça de Portugal", apps: 3, minutes: 172, goals: 2, assists: 0 },
      { season: 2002, team: "Sporting CP", competition: "UEFA Cup", apps: 2, minutes: 119, goals: 0, assists: 1 },
      { season: 2002, team: "Sporting CP", competition: "UEFA Champions League Qualifying", apps: 1, minutes: 32, goals: 0, assists: 0 },

      // Portugal, debut (Aug 2003) to June 2011, from Transfermarkt's match
      // list (transfermarkt.com/cristiano-ronaldo/nationalmannschaft/spieler/
      // 8198/verein_id/3300), goals checked against Wikipedia's list of his
      // international goals. Season = calendar year. 26 goals, Greece (Euro
      // 2004) to Argentina (Feb 2011).
      { season: 2011, team: "Portugal", competition: "International Friendlies", national: true, apps: 1, minutes: 61, goals: 1, assists: 0 },
      { season: 2011, team: "Portugal", competition: "Euro Qualification", national: true, apps: 1, minutes: 90, goals: 0, assists: 0 },
      { season: 2010, team: "Portugal", competition: "International Friendlies", national: true, apps: 5, minutes: 297, goals: 0, assists: 4 },
      { season: 2010, team: "Portugal", competition: "FIFA World Cup", national: true, apps: 4, minutes: 360, goals: 1, assists: 1 },
      { season: 2010, team: "Portugal", competition: "Euro Qualification", national: true, apps: 2, minutes: 180, goals: 2, assists: 1 },
      { season: 2009, team: "Portugal", competition: "International Friendlies", national: true, apps: 2, minutes: 123, goals: 1, assists: 0 },
      { season: 2009, team: "Portugal", competition: "World Cup Qualification", national: true, apps: 5, minutes: 387, goals: 0, assists: 1 },
      { season: 2008, team: "Portugal", competition: "International Friendlies", national: true, apps: 3, minutes: 225, goals: 0, assists: 0 },
      { season: 2008, team: "Portugal", competition: "UEFA Euro", national: true, apps: 3, minutes: 270, goals: 1, assists: 1 },
      { season: 2008, team: "Portugal", competition: "World Cup Qualification", national: true, apps: 2, minutes: 180, goals: 0, assists: 0 },
      { season: 2007, team: "Portugal", competition: "International Friendlies", national: true, apps: 1, minutes: 62, goals: 0, assists: 0 },
      { season: 2007, team: "Portugal", competition: "Euro Qualification", national: true, apps: 9, minutes: 798, goals: 5, assists: 1 },
      { season: 2006, team: "Portugal", competition: "International Friendlies", national: true, apps: 4, minutes: 287, goals: 2, assists: 1 },
      { season: 2006, team: "Portugal", competition: "FIFA World Cup", national: true, apps: 6, minutes: 484, goals: 1, assists: 0 },
      { season: 2006, team: "Portugal", competition: "Euro Qualification", national: true, apps: 4, minutes: 309, goals: 3, assists: 0 },
      { season: 2005, team: "Portugal", competition: "International Friendlies", national: true, apps: 4, minutes: 259, goals: 0, assists: 1 },
      { season: 2005, team: "Portugal", competition: "World Cup Qualification", national: true, apps: 7, minutes: 535, goals: 2, assists: 1 },
      { season: 2004, team: "Portugal", competition: "International Friendlies", national: true, apps: 5, minutes: 188, goals: 0, assists: 1 },
      { season: 2004, team: "Portugal", competition: "UEFA Euro", national: true, apps: 6, minutes: 420, goals: 2, assists: 2 },
      { season: 2004, team: "Portugal", competition: "World Cup Qualification", national: true, apps: 5, minutes: 409, goals: 5, assists: 5 },
      { season: 2003, team: "Portugal", competition: "International Friendlies", national: true, apps: 2, minutes: 90, goals: 0, assists: 0 },
    ],
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
