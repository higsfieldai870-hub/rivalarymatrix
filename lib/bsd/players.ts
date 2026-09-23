import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import type {
  Club,
  DataSource,
  MediaItem,
  PlayerBio,
  PlayerDossier,
  PlayerProfile,
  Scouting,
  StatLine,
  StatType,
  TeamRef,
  Transfer,
} from "@/lib/player-stats";
import { bsdGet, IMAGE_BASE, isBsdError, lastKnownQuota } from "./client";

// A player's dossier is assembled from their profile, season-by-season
// career, national-team record, transfers and media, plus the per-match log
// of every career row that has detailed statistics (summed into that row).
// Each request is cached on disk with a lifetime suited to how often it
// changes, and so is the finished dossier.

const HOUR = 3_600;
const DAY = 86_400;

const CLUB_FRIENDLIES = 79;

// ---------------------------------------------------------------------------
// API shapes (see /openapi.json)
// ---------------------------------------------------------------------------

type Page<T> = { count: number; next: string | null; results: T[] };
type BsdTeamRef = { id: number; name: string; short_name?: string } | null;

type BsdPlayer = {
  id: number;
  name: string;
  short_name?: string;
  position?: string;
  specific_position?: string;
  jersey_number?: number | null;
  date_of_birth?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  preferred_foot?: string;
  nationality?: string;
  national_team_id?: number | null;
  current_team?: BsdTeamRef;
  national_team?: BsdTeamRef;
  market_value_eur?: number | null;
  contract_until?: string | null;
  availability?: string;
  injury_type?: string;
  injury_expected_return?: string | null;
  attributes?: {
    attacking?: number | null;
    technical?: number | null;
    tactical?: number | null;
    defending?: number | null;
    creativity?: number | null;
    position?: string | null;
  } | null;
  strengths?: string[];
  weaknesses?: string[];
  rating?: number | null;
  potential?: string | null;
  injury_risk?: string | null;
  wage_eur_annual?: number | null;
};

type BsdCareerRow = {
  season_id: number;
  league_id: number | null;
  team_id: number | null;
  matches: number;
  minutes: number;
  goals: number;
  assists: number;
  avg_rating: number | null;
};

type BsdNational = {
  national_team_id: number | null;
  caps: number;
  goals: number;
  last_appearance: string | null;
};

type BsdTransfer = {
  transfer_date: string | null;
  from_team_id: number | null;
  from_team_name: string;
  to_team_id: number | null;
  to_team_name: string;
  fee_eur: number | null;
  fee_description: string;
};

type BsdMatchStat = Record<string, number | null>;

type BsdLeague = { id: number; name: string; country: string };
type BsdSeason = { id: number; name: string; year: number | null; end_date: string | null };
type BsdTeam = { id: number; name: string; short_name?: string };

type BsdSocialItem = {
  type: string;
  url: string;
  text?: string;
  title?: string;
  published_at: string;
  account?: { handle?: string; name?: string };
};

// ---------------------------------------------------------------------------
// Cached requests
// ---------------------------------------------------------------------------

async function orNull<T>(promise: Promise<T>) {
  try {
    return await promise;
  } catch (error) {
    if (isBsdError(error) && error.kind === "not-found") return null;
    throw error;
  }
}

const getPlayer = unstable_cache(
  (id: number) => orNull(bsdGet<BsdPlayer>(`/players/${id}/`)),
  ["bsd", "player"],
  { revalidate: DAY },
);

const getCareer = unstable_cache(
  async (id: number) =>
    (await orNull(bsdGet<{ seasons: BsdCareerRow[] }>(`/players/${id}/career/`)))?.seasons ?? [],
  ["bsd", "career"],
  { revalidate: DAY },
);

const getNational = unstable_cache(
  (id: number) => orNull(bsdGet<BsdNational>(`/players/${id}/national-team/`)),
  ["bsd", "national"],
  { revalidate: DAY },
);

const getTransfers = unstable_cache(
  async (id: number) =>
    (await orNull(bsdGet<{ transfers: BsdTransfer[] }>(`/players/${id}/transfers/`)))?.transfers ?? [],
  ["bsd", "transfers"],
  { revalidate: DAY },
);

const getMedia = unstable_cache(
  async (id: number) =>
    (await orNull(bsdGet<Page<BsdSocialItem>>(`/players/${id}/social/`, { limit: 6 })))?.results ?? [],
  ["bsd", "social"],
  { revalidate: 6 * HOUR },
);

const getLeagues = unstable_cache(
  async () => {
    const leagues: BsdLeague[] = [];
    for (let offset = 0; ; offset += 200) {
      const page = await bsdGet<Page<BsdLeague>>("/leagues/", {
        include_inactive: "true",
        limit: 200,
        offset,
      });
      leagues.push(...page.results);
      if (!page.next) return leagues;
    }
  },
  ["bsd", "leagues"],
  { revalidate: 7 * DAY },
);

const getLeagueSeasons = unstable_cache(
  async (leagueId: number) =>
    (await orNull(bsdGet<{ seasons: BsdSeason[] }>(`/leagues/${leagueId}/seasons/`)))?.seasons ?? [],
  ["bsd", "league-seasons"],
  { revalidate: 7 * DAY },
);

const getTeam = unstable_cache(
  (id: number) => orNull(bsdGet<BsdTeam>(`/teams/${id}/`)),
  ["bsd", "team"],
  { revalidate: 30 * DAY },
);

// One career row's matches. Finished seasons never change, so they are
// kept for a month; the current one refreshes every few hours.
async function rowStats(playerId: number, seasonId: number, leagueId: number, teamId: number | null) {
  const matches: BsdMatchStat[] = [];
  const filters: Record<string, number> = { season_id: seasonId, league_id: leagueId, limit: 200 };
  if (teamId !== null) filters.team_id = teamId;

  for (let offset = 0; ; offset += 200) {
    const page = await bsdGet<Page<BsdMatchStat>>(`/players/${playerId}/stats/`, { ...filters, offset });
    matches.push(...page.results);
    if (!page.next) return matches;
  }
}

const getFinishedRowStats = unstable_cache(rowStats, ["bsd", "row-stats"], { revalidate: 30 * DAY });
const getCurrentRowStats = unstable_cache(rowStats, ["bsd", "row-stats-current"], {
  revalidate: 6 * HOUR,
});

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

const POSITIONS: Record<string, string> = {
  G: "Goalkeeper",
  D: "Defender",
  M: "Midfielder",
  F: "Forward",
};

const FEET: Record<string, string> = { l: "Left", left: "Left", r: "Right", right: "Right", both: "Both" };

const teamLogo = (id: number | null | undefined) => (id ? `${IMAGE_BASE}/team/${id}/` : null);

function ageFrom(dob: string | null | undefined) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

function toProfile(p: BsdPlayer): PlayerProfile {
  const [first, ...rest] = p.name.split(" ");
  // Short codes such as "FWD" repeat the generic position, so skip them.
  const specific = p.specific_position && p.specific_position.length > 3 ? p.specific_position : null;

  return {
    id: p.id,
    name: p.short_name || p.name,
    firstname: rest.length ? first : null,
    lastname: rest.length ? rest.join(" ") : p.name,
    age: ageFrom(p.date_of_birth),
    birthDate: p.date_of_birth ?? null,
    birthPlace: null,
    birthCountry: null,
    nationality: p.nationality || null,
    height: p.height_cm ? `${p.height_cm} cm` : null,
    weight: p.weight_kg ? `${p.weight_kg} kg` : null,
    number: p.jersey_number ?? null,
    position: POSITIONS[p.position ?? ""] ?? null,
    detailedPosition: p.attributes?.position || specific,
    preferredFoot: FEET[(p.preferred_foot ?? "").toLowerCase()] ?? null,
    photo: `${IMAGE_BASE}/player/${p.id}/?sor=true`,
    currentTeam: p.current_team?.name ?? null,
  };
}

function toBio(p: BsdPlayer, national: BsdNational | null): PlayerBio {
  const nationalTeam = p.national_team ?? null;
  return {
    marketValueEur: p.market_value_eur ?? null,
    wageEurAnnual: p.wage_eur_annual ?? null,
    contractUntil: p.contract_until ?? null,
    availability: p.availability || null,
    injuryType: p.injury_type || null,
    injuryReturn: p.injury_expected_return ?? null,
    nationalTeam: nationalTeam
      ? { id: nationalTeam.id, name: nationalTeam.name, logo: teamLogo(nationalTeam.id) }
      : null,
    caps: national?.national_team_id ? national.caps : null,
    internationalGoals: national?.national_team_id ? national.goals : null,
    lastInternational: national?.last_appearance ?? null,
  };
}

function toScouting(p: BsdPlayer): Scouting | null {
  const a = p.attributes ?? {};
  const scouting: Scouting = {
    attacking: a.attacking ?? null,
    technical: a.technical ?? null,
    tactical: a.tactical ?? null,
    defending: a.defending ?? null,
    creativity: a.creativity ?? null,
    role: a.position ?? null,
    rating: p.rating ?? null,
    potential: p.potential ?? null,
    injuryRisk: p.injury_risk ?? null,
    strengths: p.strengths ?? [],
    weaknesses: p.weaknesses ?? [],
  };
  const hasAny = Object.values(scouting).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== null,
  );
  return hasAny ? scouting : null;
}

// Per-match fields mapped onto named StatLine fields. Every other numeric
// field becomes an "extra", so nothing the API returns is dropped.
const NOT_EXTRA = new Set([
  "id",
  "player_id",
  "event_id",
  "team_id",
  "minutes_played",
  "rating",
  "goals",
  "goal_assist",
  "total_shots",
  "shots_on_target",
  "total_pass",
  "accurate_pass",
  "key_pass",
  "total_tackle",
  "outfielder_block",
  "interception",
  "duel_won",
  "duel_lost",
  "total_contest",
  "won_contest",
  "challenge_lost",
  "was_fouled",
  "fouls",
  "yellow_card",
  "red_card",
  "saves",
  "goals_conceded",
]);

const EXTRA_LABELS: Record<string, string> = {
  expected_goals: "Expected Goals (xG)",
  expected_assists: "Expected Assists (xA)",
  expected_goals_on_target: "xG On Target (xGOT)",
  big_chance_created: "Big Chances Created",
  big_chance_missed: "Big Chances Missed",
  total_long_balls: "Long Balls",
  accurate_long_balls: "Accurate Long Balls",
  total_cross: "Crosses",
  accurate_cross: "Accurate Crosses",
  aerial_won: "Aerials Won",
  aerial_lost: "Aerials Lost",
  won_tackle: "Tackles Won",
  total_clearance: "Clearances",
  ball_recovery: "Ball Recoveries",
  blocked_scoring_attempt: "Shots Blocked",
  total_offside: "Offsides",
  error_lead_to_a_goal: "Errors Leading To A Goal",
  error_lead_to_a_shot: "Errors Leading To A Shot",
  last_man_tackle: "Last-Man Tackles",
  clearance_off_line: "Clearances Off The Line",
  saved_shots_from_inside_the_box: "Saves Inside The Box",
  high_claims: "High Claims",
  good_high_claim: "Good High Claims",
  accurate_keeper_sweeper: "Accurate Sweeper Actions",
  total_keeper_sweeper: "Sweeper Actions",
  ball_carries_count: "Ball Carries",
  progressive_ball_carries_count: "Progressive Carries",
  total_ball_carries_distance: "Carry Distance",
  total_progressive_ball_carries_distance: "Progressive Carry Distance",
  best_ball_carry_progression: "Best Carry Progression",
  defensive_value_normalized: "Defensive Value",
  pass_value_normalized: "Passing Value",
  shot_value_normalized: "Shooting Value",
  dribble_value_normalized: "Dribbling Value",
  goalkeeper_value_normalized: "Goalkeeping Value",
  accurate_opposition_half_passes: "Accurate Passes In Opposition Half",
  total_opposition_half_passes: "Passes In Opposition Half",
  accurate_own_half_passes: "Accurate Passes In Own Half",
  total_own_half_passes: "Passes In Own Half",
};

const labelFor = (field: string) =>
  EXTRA_LABELS[field] ??
  field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Normalised values and best-of figures average rather than add up.
const isAverage = (field: string) => /_normalized$|^best_/.test(field);

// BSD names tournaments after their latest edition ("World Cup 2026"), which
// would label a 2014 World Cup match as 2026. The season says which edition.
const competitionName = (name: string) => name.replace(/\s+(19|20)\d{2}$/, "");

type SeasonInfo = { name: string; year: number | null; finished: boolean };

function toLine(
  row: BsdCareerRow,
  matches: BsdMatchStat[],
  context: {
    season: SeasonInfo | undefined;
    league: BsdLeague | undefined;
    teamName: string;
    nationalTeamId: number | null;
    types: Record<string, StatType>;
  },
): StatLine | null {
  const { season, league, teamName, nationalTeamId, types } = context;
  const year = season?.year ?? Number(season?.name.match(/\d{4}/)?.[0] ?? NaN);
  if (!Number.isFinite(year)) return null;

  const tracked = matches.some((m) => (m.touches ?? 0) > 0 || (m.total_pass ?? 0) > 0);
  const sum = (field: string) => matches.reduce((total, m) => total + (m[field] ?? 0), 0);
  const detail = (field: string) => (tracked ? sum(field) : null);

  const extra: Record<string, number> = {};
  if (tracked) {
    const fields = new Set(matches.flatMap((m) => Object.keys(m)));
    for (const field of fields) {
      if (NOT_EXTRA.has(field)) continue;
      const values = matches.map((m) => m[field]).filter((v): v is number => typeof v === "number");
      if (!values.length) continue;
      const average = isAverage(field);
      extra[field] = average ? values.reduce((a, b) => a + b, 0) / values.length : sum(field);
      types[field] ??= { name: labelFor(field), average };
    }
  }

  const teamId = row.team_id ?? 0;
  return {
    season: year,
    seasonName: season?.name ?? String(year),
    team: { id: teamId, name: teamName, logo: teamLogo(row.team_id) },
    league: {
      id: row.league_id ?? 0,
      name: league ? competitionName(league.name) : "Other matches",
      country: league?.country ?? "",
      logo: row.league_id ? `${IMAGE_BASE}/league/${row.league_id}/` : null,
    },
    national:
      (nationalTeamId !== null && row.team_id === nationalTeamId) || league?.country === "International",
    tracked,

    apps: row.matches,
    minutes: row.minutes,
    goals: row.goals,
    assists: row.assists,
    rating: row.avg_rating,

    shots: detail("total_shots"),
    shotsOn: detail("shots_on_target"),
    passes: detail("total_pass"),
    accuratePasses: detail("accurate_pass"),
    keyPasses: detail("key_pass"),
    tackles: detail("total_tackle"),
    blocks: detail("outfielder_block"),
    interceptions: detail("interception"),
    duels: tracked ? sum("duel_won") + sum("duel_lost") : null,
    duelsWon: detail("duel_won"),
    dribbles: detail("total_contest"),
    dribblesWon: detail("won_contest"),
    dribbledPast: detail("challenge_lost"),
    foulsDrawn: detail("was_fouled"),
    foulsCommitted: detail("fouls"),
    yellow: detail("yellow_card"),
    red: detail("red_card"),
    saves: detail("saves"),
    conceded: detail("goals_conceded"),

    extra,
  };
}

function compactEuros(value: number) {
  if (value >= 1_000_000) return `€${Number((value / 1_000_000).toFixed(1))}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

function feeText(t: BsdTransfer) {
  const description = t.fee_description.trim();
  if (description && description !== "-") {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }
  return t.fee_eur ? compactEuros(t.fee_eur) : null;
}

function toTransfer(t: BsdTransfer): Transfer {
  const ref = (id: number | null, name: string): TeamRef | null =>
    name ? { id: id ?? 0, name, logo: teamLogo(id) } : null;
  return {
    date: t.transfer_date ?? "",
    type: feeText(t),
    from: ref(t.from_team_id, t.from_team_name),
    to: ref(t.to_team_id, t.to_team_name),
  };
}

function toMedia(item: BsdSocialItem): MediaItem {
  return {
    type: item.type,
    url: item.url,
    title: (item.title || item.text || "").trim(),
    publishedAt: item.published_at,
    account: item.account?.name || item.account?.handle || "",
  };
}

// ---------------------------------------------------------------------------
// Dossier
// ---------------------------------------------------------------------------

async function optional<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    // Quota and key problems must surface; anything else just hides a section.
    if (isBsdError(error) && ["quota", "auth", "missing-key"].includes(error.kind)) throw error;
    return null;
  }
}

async function buildDossier(id: number): Promise<PlayerDossier | null> {
  const player = await getPlayer(id);
  if (!player) return null;

  const [career, national, transfers, media, leagues] = await Promise.all([
    getCareer(id),
    optional(getNational(id)),
    optional(getTransfers(id)),
    optional(getMedia(id)),
    getLeagues(),
  ]);

  const leagueById = new Map(leagues.map((l) => [l.id, l]));
  const rows = career.filter((r) => r.matches > 0 && r.league_id !== CLUB_FRIENDLIES);

  // Season names and years, one request per league.
  const leagueIds = [...new Set(rows.map((r) => r.league_id).filter((l): l is number => l !== null))];
  const today = new Date().toISOString().slice(0, 10);
  const seasonById = new Map<number, SeasonInfo>();
  const seasonLists = await Promise.all(leagueIds.map((l) => optional(getLeagueSeasons(l))));
  for (const list of seasonLists) {
    for (const s of list ?? []) {
      seasonById.set(s.id, { name: s.name, year: s.year, finished: Boolean(s.end_date && s.end_date < today) });
    }
  }

  // Team names from what we already have, then a lookup for the rest.
  const teamNames = new Map<number, string>();
  for (const t of [player.current_team, player.national_team]) if (t) teamNames.set(t.id, t.name);
  for (const t of transfers ?? []) {
    if (t.from_team_id && t.from_team_name) teamNames.set(t.from_team_id, t.from_team_name);
    if (t.to_team_id && t.to_team_name) teamNames.set(t.to_team_id, t.to_team_name);
  }
  const unknownTeams = [...new Set(rows.map((r) => r.team_id))].filter(
    (t): t is number => t !== null && !teamNames.has(t),
  );
  const looked = await Promise.all(unknownTeams.map((t) => optional(getTeam(t))));
  for (const team of looked) if (team) teamNames.set(team.id, team.name);

  // Per-match detail only exists for rows that carry ratings (roughly
  // 2015 onwards), so older rows keep their summary numbers.
  const statTypes: Record<string, StatType> = {};
  const lines = await Promise.all(
    rows.map(async (row) => {
      const season = seasonById.get(row.season_id);
      let matches: BsdMatchStat[] = [];
      if (row.avg_rating !== null && row.league_id !== null) {
        const fetchRow = season?.finished ? getFinishedRowStats : getCurrentRowStats;
        matches = (await optional(fetchRow(id, row.season_id, row.league_id, row.team_id))) ?? [];
      }
      return toLine(row, matches, {
        season,
        league: row.league_id !== null ? leagueById.get(row.league_id) : undefined,
        teamName: (row.team_id && teamNames.get(row.team_id)) || "Unknown team",
        nationalTeamId: player.national_team_id ?? null,
        types: statTypes,
      });
    }),
  );
  const statLines = lines.filter((l): l is StatLine => l !== null);

  // Clubs from the career rows (with seasons) and transfer history.
  const clubs = new Map<number, Club & { years: Set<number> }>();
  const addClub = (team: TeamRef, national: boolean, year?: number) => {
    // "No team" is how BSD records free agency, not a club.
    if (!team.id || /^no team$/i.test(team.name)) return;
    const club = clubs.get(team.id) ?? { ...team, national, seasons: [], years: new Set<number>() };
    if (year !== undefined) club.years.add(year);
    clubs.set(team.id, club);
  };
  for (const line of statLines) addClub(line.team, line.national, line.season);
  const mappedTransfers = (transfers ?? []).map(toTransfer);
  for (const t of mappedTransfers) {
    if (t.from) addClub(t.from, false);
    if (t.to) addClub(t.to, false);
  }

  const profile = toProfile(player);
  const current = player.current_team;

  return {
    profile,
    bio: toBio(player, national),
    scouting: toScouting(player),
    currentClub: current ? { id: current.id, name: current.name, logo: teamLogo(current.id) } : null,
    injured: player.availability ? player.availability === "injured" : null,
    lines: statLines,
    seasonsLoaded: [...new Set(statLines.map((l) => l.season))].sort((a, b) => b - a),
    statTypes,
    clubs: [...clubs.values()]
      .map(({ years, ...club }) => ({ ...club, seasons: [...years].sort((a, b) => a - b) }))
      .sort((a, b) => (b.seasons.at(-1) ?? 0) - (a.seasons.at(-1) ?? 0)),
    // BSD has no trophy or injury-history data for players.
    trophies: null,
    transfers: transfers ? mappedTransfers.sort((a, b) => b.date.localeCompare(a.date)) : null,
    injuries: null,
    media: media ? media.map(toMedia) : null,
    warnings: [],
  };
}

export type DossierResult =
  | { status: "ok"; dossier: PlayerDossier }
  | { status: "missing"; message: string };

// The version in the key rebuilds cached dossiers after a mapping change.
export const getPlayerDossier = cache(
  unstable_cache(
    async (id: number): Promise<DossierResult> => {
      const dossier = await buildDossier(id);
      return dossier
        ? { status: "ok", dossier }
        : { status: "missing", message: `BSD has no player with id ${id}.` };
    },
    ["bsd", "dossier", "v2"],
    { revalidate: 6 * HOUR },
  ),
);

export const getProfile = cache(
  unstable_cache(
    async (id: number) => {
      const player = await getPlayer(id);
      return player ? toProfile(player) : null;
    },
    ["bsd", "profile"],
    { revalidate: DAY },
  ),
);

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// BSD returns name matches alphabetically; rank whole-word matches first,
// then word prefixes, each ordered by market value so the best-known player
// with that name comes first.
export const searchPlayers = cache(
  unstable_cache(
    async (query: string): Promise<PlayerProfile[]> => {
      const page = await bsdGet<Page<BsdPlayer>>("/players/", { name: query, limit: 50 });
      const q = normalize(query);
      const score = (p: BsdPlayer) => {
        const name = normalize(p.name);
        const words = name.split(/\s+/);
        if (name === q || words.includes(q) || name.includes(` ${q}`)) return 0;
        if (words.some((w) => w.startsWith(q))) return 1;
        return 2;
      };
      return page.results
        .sort((a, b) => score(a) - score(b) || (b.market_value_eur ?? 0) - (a.market_value_eur ?? 0))
        .slice(0, 20)
        .map(toProfile);
    },
    ["bsd", "search"],
    { revalidate: DAY },
  ),
);

export function getDataSource(): DataSource {
  return { provider: "BSD (Bzzoiro Sports Data)", quota: lastKnownQuota() };
}
