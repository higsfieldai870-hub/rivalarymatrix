// Framework-free helpers for player data. The server maps BSD (Bzzoiro
// Sports Data) responses into a dossier per player; the browser slices those
// dossiers by scope (career, club, international...) and derives every
// metric shown.

export type Num = number | null;

export type TeamRef = { id: number; name: string; logo: string | null };

export type PlayerProfile = {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  age: Num;
  birthDate: string | null;
  birthPlace: string | null;
  birthCountry: string | null;
  nationality: string | null;
  height: string | null;
  weight: string | null;
  number: Num;
  position: string | null;
  detailedPosition: string | null;
  preferredFoot: string | null;
  photo: string;
  currentTeam: string | null;
};

// One season of one competition for one team. Appearances, minutes, goals,
// assists and rating always come from the career summary; detailed fields
// are null when no per-match statistics exist for that row (older seasons).
// `extra` holds every other per-match statistic, keyed by field name.
export type StatLine = {
  season: number;
  seasonName: string;
  team: TeamRef;
  league: { id: number; name: string; country: string; logo: string | null };
  national: boolean;
  tracked: boolean;

  apps: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: Num;

  shots: Num;
  shotsOn: Num;
  passes: Num;
  accuratePasses: Num;
  keyPasses: Num;
  tackles: Num;
  blocks: Num;
  interceptions: Num;
  duels: Num;
  duelsWon: Num;
  dribbles: Num;
  dribblesWon: Num;
  dribbledPast: Num;
  foulsDrawn: Num;
  foulsCommitted: Num;
  yellow: Num;
  red: Num;
  saves: Num;
  conceded: Num;

  extra: Record<string, number>;
};

// Name for an extra statistic, and whether it averages (normalised values)
// rather than adds up across matches.
export type StatType = { name: string; average: boolean };

export type Club = TeamRef & { national: boolean; seasons: number[] };
export type Honour = { league: string; country: string; count: number; seasons: string[] };
export type TrophySummary = { winners: Honour[]; totalWins: number; runnersUp: number };
export type Transfer = { date: string; type: string | null; from: TeamRef | null; to: TeamRef | null };
export type Injury = { type: string; start: string | null; end: string | null };

export type Scouting = {
  attacking: Num;
  technical: Num;
  tactical: Num;
  defending: Num;
  creativity: Num;
  role: string | null;
  rating: Num;
  potential: string | null;
  injuryRisk: string | null;
  strengths: string[];
  weaknesses: string[];
};

export type PlayerBio = {
  marketValueEur: Num;
  wageEurAnnual: Num;
  contractUntil: string | null;
  availability: string | null;
  injuryType: string | null;
  injuryReturn: string | null;
  nationalTeam: TeamRef | null;
  caps: Num;
  internationalGoals: Num;
  lastInternational: string | null;
};

export type MediaItem = {
  type: string;
  url: string;
  title: string;
  publishedAt: string;
  account: string;
};

export type PlayerDossier = {
  profile: PlayerProfile;
  bio: PlayerBio;
  scouting: Scouting | null;
  currentClub: TeamRef | null;
  injured: boolean | null;
  lines: StatLine[];
  seasonsLoaded: number[];
  statTypes: Record<string, StatType>;
  clubs: Club[];
  trophies: TrophySummary | null;
  transfers: Transfer[] | null;
  injuries: Injury[] | null;
  media: MediaItem[] | null;
  warnings: string[];
};

export type Side = "left" | "right";

// What the data provider reported about coverage and quota.
export type DataSource = {
  provider: string;
  quota: { remaining: number; limit: number } | null;
};

// ---------------------------------------------------------------------------
// Scopes
// ---------------------------------------------------------------------------

export const scopes = [
  { id: "career", label: "Career" },
  { id: "club", label: "Club" },
  { id: "international", label: "International" },
  { id: "ucl", label: "Champions League" },
  { id: "latest", label: "Latest Season" },
] as const;

export type Scope = (typeof scopes)[number]["id"];

const isChampionsLeague = (name: string) => /^(uefa )?champions league$/i.test(name);

export function seasonLabel(season: number) {
  return `${season}/${String((season + 1) % 100).padStart(2, "0")}`;
}

export function latestSeason(...dossiers: PlayerDossier[]) {
  const seasons = dossiers.flatMap((d) => d.lines.map((l) => l.season));
  return seasons.length ? Math.max(...seasons) : null;
}

export function filterLines(lines: StatLine[], scope: Scope, latest: number | null) {
  switch (scope) {
    case "club":
      return lines.filter((l) => !l.national);
    case "international":
      return lines.filter((l) => l.national);
    case "ucl":
      return lines.filter((l) => isChampionsLeague(l.league.name));
    case "latest":
      return lines.filter((l) => l.season === latest);
    default:
      return lines;
  }
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

const trackedKeys = [
  "shots",
  "shotsOn",
  "passes",
  "accuratePasses",
  "keyPasses",
  "tackles",
  "blocks",
  "interceptions",
  "duels",
  "duelsWon",
  "dribbles",
  "dribblesWon",
  "dribbledPast",
  "foulsDrawn",
  "foulsCommitted",
  "yellow",
  "red",
  "saves",
  "conceded",
] as const;

type TrackedKey = (typeof trackedKeys)[number];

// Sums over the rows that carry per-match statistics only.
type TrackedTotals = Record<TrackedKey | "apps" | "minutes" | "goals" | "assists", number>;

export type Totals = {
  rows: number;
  seasons: number;
  competitions: number;
  apps: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: Num;
  passAccuracy: Num;
  tracked: TrackedTotals;
  extra: Record<string, number>;
};

export function totals(lines: StatLine[], types: Record<string, StatType> = {}): Totals {
  const tracked = Object.fromEntries(
    [...trackedKeys, "apps", "minutes", "goals", "assists"].map((k) => [k, 0]),
  ) as TrackedTotals;

  const t: Totals = {
    rows: lines.length,
    seasons: new Set(lines.map((l) => l.season)).size,
    competitions: new Set(lines.map((l) => l.league.id)).size,
    apps: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    rating: null,
    passAccuracy: null,
    tracked,
    extra: {},
  };

  let ratingSum = 0;
  let ratingWeight = 0;
  const averageWeights: Record<string, number> = {};

  for (const l of lines) {
    t.apps += l.apps;
    t.minutes += l.minutes;
    t.goals += l.goals;
    t.assists += l.assists;

    if (l.rating !== null) {
      const weight = l.minutes || l.apps;
      ratingSum += l.rating * weight;
      ratingWeight += weight;
    }

    for (const [code, value] of Object.entries(l.extra)) {
      if (types[code]?.average) {
        const weight = l.minutes || l.apps;
        t.extra[code] = (t.extra[code] ?? 0) + value * weight;
        averageWeights[code] = (averageWeights[code] ?? 0) + weight;
      } else {
        t.extra[code] = (t.extra[code] ?? 0) + value;
      }
    }

    if (l.tracked) {
      tracked.apps += l.apps;
      tracked.minutes += l.minutes;
      tracked.goals += l.goals;
      tracked.assists += l.assists;
      for (const key of trackedKeys) tracked[key] += l[key] ?? 0;
    }
  }

  for (const [code, weight] of Object.entries(averageWeights)) {
    t.extra[code] = weight ? t.extra[code] / weight : 0;
  }

  t.rating = ratingWeight ? ratingSum / ratingWeight : null;
  t.passAccuracy = tracked.passes ? (tracked.accuratePasses / tracked.passes) * 100 : null;
  return t;
}

const ratio = (a: number, b: number, scale = 1): Num => (b > 0 ? (a / b) * scale : null);
const per90 = (value: number, minutes: number): Num => ratio(value, minutes, 90);
const detail = (t: Totals, key: TrackedKey): Num => (t.tracked.apps > 0 ? t.tracked[key] : null);
const detail90 = (t: Totals, key: TrackedKey): Num =>
  t.tracked.apps > 0 ? per90(t.tracked[key], t.tracked.minutes) : null;

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type MetricDef = {
  id: string;
  label: string;
  category: string;
  decimals?: number;
  unit?: string;
  value: (t: Totals) => Num;
};

export const metricDefs: MetricDef[] = [
  { id: "goals", label: "Goals", category: "Output", value: (t) => t.goals },
  { id: "assists", label: "Assists", category: "Output", value: (t) => t.assists },
  { id: "ga", label: "Goal Contributions", category: "Output", value: (t) => t.goals + t.assists },
  { id: "apps", label: "Appearances", category: "Output", value: (t) => t.apps },
  { id: "minutes", label: "Minutes", category: "Output", value: (t) => t.minutes },
  { id: "goalsPerGame", label: "Goals / Game", category: "Output", decimals: 2, value: (t) => ratio(t.goals, t.apps) },
  { id: "gaPerGame", label: "G+A / Game", category: "Output", decimals: 2, value: (t) => ratio(t.goals + t.assists, t.apps) },
  { id: "minPerGoal", label: "Minutes / Goal", category: "Output", value: (t) => ratio(t.minutes, t.goals) },
  { id: "rating", label: "Average Rating", category: "Output", decimals: 2, value: (t) => t.rating },

  { id: "shots", label: "Shots", category: "Shooting", value: (t) => detail(t, "shots") },
  { id: "shotsOn", label: "Shots On Target", category: "Shooting", value: (t) => detail(t, "shotsOn") },
  { id: "shotAccuracy", label: "Shot Accuracy", category: "Shooting", unit: "%", value: (t) => ratio(t.tracked.shotsOn, t.tracked.shots, 100) },
  { id: "conversion", label: "Shot Conversion", category: "Shooting", unit: "%", value: (t) => ratio(t.tracked.goals, t.tracked.shots, 100) },
  { id: "shotsPer90", label: "Shots / 90", category: "Shooting", decimals: 2, value: (t) => detail90(t, "shots") },

  { id: "keyPasses", label: "Key Passes", category: "Creativity", value: (t) => detail(t, "keyPasses") },
  { id: "keyPassesPer90", label: "Key Passes / 90", category: "Creativity", decimals: 2, value: (t) => detail90(t, "keyPasses") },
  { id: "passes", label: "Passes", category: "Creativity", value: (t) => detail(t, "passes") },
  { id: "accuratePasses", label: "Accurate Passes", category: "Creativity", value: (t) => detail(t, "accuratePasses") },
  { id: "passAccuracy", label: "Pass Accuracy", category: "Creativity", unit: "%", value: (t) => t.passAccuracy },

  { id: "dribbles", label: "Dribbles Attempted", category: "Dribbling & Duels", value: (t) => detail(t, "dribbles") },
  { id: "dribblesWon", label: "Successful Dribbles", category: "Dribbling & Duels", value: (t) => detail(t, "dribblesWon") },
  { id: "dribbleSuccess", label: "Dribble Success", category: "Dribbling & Duels", unit: "%", value: (t) => ratio(t.tracked.dribblesWon, t.tracked.dribbles, 100) },
  { id: "duels", label: "Duels", category: "Dribbling & Duels", value: (t) => detail(t, "duels") },
  { id: "duelsWon", label: "Duels Won", category: "Dribbling & Duels", value: (t) => detail(t, "duelsWon") },
  { id: "duelWin", label: "Duel Win Rate", category: "Dribbling & Duels", unit: "%", value: (t) => ratio(t.tracked.duelsWon, t.tracked.duels, 100) },
  { id: "foulsDrawn", label: "Fouls Drawn", category: "Dribbling & Duels", value: (t) => detail(t, "foulsDrawn") },

  { id: "tackles", label: "Tackles", category: "Defending", value: (t) => detail(t, "tackles") },
  { id: "interceptions", label: "Interceptions", category: "Defending", value: (t) => detail(t, "interceptions") },
  { id: "blocks", label: "Blocks", category: "Defending", value: (t) => detail(t, "blocks") },
  { id: "dribbledPast", label: "Dribbled Past", category: "Defending", value: (t) => detail(t, "dribbledPast") },

  { id: "foulsCommitted", label: "Fouls Committed", category: "Discipline", value: (t) => detail(t, "foulsCommitted") },
  { id: "yellow", label: "Yellow Cards", category: "Discipline", value: (t) => detail(t, "yellow") },
  { id: "red", label: "Red Cards", category: "Discipline", value: (t) => detail(t, "red") },

  { id: "saves", label: "Saves", category: "Goalkeeping", value: (t) => (t.tracked.saves ? t.tracked.saves : null) },
  { id: "conceded", label: "Goals Conceded", category: "Goalkeeping", value: (t) => (t.tracked.saves ? t.tracked.conceded : null) },
];

export type Per90Def = { label: string; value: (t: Totals) => Num };

export const per90Defs: Per90Def[] = [
  { label: "Goals", value: (t) => per90(t.goals, t.minutes) },
  { label: "Assists", value: (t) => per90(t.assists, t.minutes) },
  { label: "Goal Contributions", value: (t) => per90(t.goals + t.assists, t.minutes) },
  { label: "Shots", value: (t) => detail90(t, "shots") },
  { label: "Key Passes", value: (t) => detail90(t, "keyPasses") },
  { label: "Successful Dribbles", value: (t) => detail90(t, "dribblesWon") },
  { label: "Duels Won", value: (t) => detail90(t, "duelsWon") },
  {
    label: "Tackles + Interceptions",
    value: (t) =>
      t.tracked.apps > 0 ? per90(t.tracked.tackles + t.tracked.interceptions, t.tracked.minutes) : null,
  },
];

export type RadarAxis = { label: string; hint: string; unit?: string; value: (t: Totals) => Num };

export const radarAxes: RadarAxis[] = [
  { label: "Scoring", hint: "goals / 90", value: (t) => per90(t.goals, t.minutes) },
  { label: "Shooting", hint: "shots / 90", value: (t) => detail90(t, "shots") },
  { label: "Accuracy", hint: "shot accuracy", unit: "%", value: (t) => ratio(t.tracked.shotsOn, t.tracked.shots, 100) },
  { label: "Creativity", hint: "key passes / 90", value: (t) => detail90(t, "keyPasses") },
  { label: "Assisting", hint: "assists / 90", value: (t) => per90(t.assists, t.minutes) },
  { label: "Dribbling", hint: "successful dribbles / 90", value: (t) => detail90(t, "dribblesWon") },
  { label: "Duels", hint: "duel win rate", unit: "%", value: (t) => ratio(t.tracked.duelsWon, t.tracked.duels, 100) },
  { label: "Passing", hint: "pass accuracy", unit: "%", value: (t) => t.passAccuracy },
];

// ---------------------------------------------------------------------------
// Per-season and per-competition breakdowns
// ---------------------------------------------------------------------------

export type SeasonRow = {
  season: number;
  clubs: string[];
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
  rating: Num;
};

export function bySeason(lines: StatLine[]): Map<number, SeasonRow> {
  const groups = new Map<number, StatLine[]>();
  for (const l of lines) {
    const group = groups.get(l.season) ?? [];
    group.push(l);
    groups.set(l.season, group);
  }

  const rows = new Map<number, SeasonRow>();
  for (const [season, group] of groups) {
    const t = totals(group);
    rows.set(season, {
      season,
      clubs: [...new Set(group.map((l) => l.team.name))],
      apps: t.apps,
      goals: t.goals,
      assists: t.assists,
      minutes: t.minutes,
      rating: t.rating,
    });
  }
  return rows;
}

export type CompetitionRow = {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  seasons: number;
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
};

export function byCompetition(lines: StatLine[]): CompetitionRow[] {
  const rows = new Map<number, CompetitionRow & { seasonSet: Set<number> }>();
  for (const l of lines) {
    const row = rows.get(l.league.id) ?? {
      ...l.league,
      seasons: 0,
      apps: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      seasonSet: new Set<number>(),
    };
    row.apps += l.apps;
    row.goals += l.goals;
    row.assists += l.assists;
    row.minutes += l.minutes;
    row.seasonSet.add(l.season);
    rows.set(l.league.id, row);
  }

  return [...rows.values()]
    .map(({ seasonSet, ...row }) => ({ ...row, seasons: seasonSet.size }))
    .sort((a, b) => b.apps - a.apps || b.goals - a.goals);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatNum(value: Num, { decimals = 0, unit = "" } = {}) {
  if (value === null || !Number.isFinite(value)) return "–";
  const text =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-US");
  return `${text}${unit}`;
}

// 16300000 -> "16.3M", 250000 -> "250K".
export function formatCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

// Left player's share of the combined value, or null when either is missing.
export function leftShare(left: Num, right: Num): Num {
  if (left === null || right === null) return null;
  const total = left + right;
  return total === 0 ? 0.5 : left / total;
}

export function daysBetween(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const ms = Date.parse(end) - Date.parse(start);
  return Number.isFinite(ms) && ms >= 0 ? Math.round(ms / 86_400_000) : null;
}

// Total days out, counting overlapping absences only once.
export function daysMissed(injuries: Injury[]) {
  const spans = injuries
    .map((i) => [Date.parse(i.start ?? ""), Date.parse(i.end ?? "")])
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && end >= start)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let current: number[] | null = null;
  for (const span of spans) {
    if (current && span[0] <= current[1]) {
      current[1] = Math.max(current[1], span[1]);
    } else {
      if (current) total += current[1] - current[0];
      current = [...span];
    }
  }
  if (current) total += current[1] - current[0];
  return Math.round(total / 86_400_000);
}
