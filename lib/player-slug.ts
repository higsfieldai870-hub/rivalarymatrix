import type { PlayerProfile } from "@/lib/player-stats";

// Comparison URLs name both players: /compare/erling-haaland-vs-kylian-mbappe.
// A name leads to the best-known player with exactly that name, so a
// lesser-known namesake keeps their BSD id as well: /compare/danilo-5034-vs-….

export type SideRef = { slug: string; id: number | null };

// Letters that don't decompose into a base letter plus an accent.
const LETTERS: Record<string, string> = {
  ø: "o",
  æ: "ae",
  œ: "oe",
  ß: "ss",
  ł: "l",
  đ: "d",
  ð: "d",
  þ: "th",
  ı: "i",
};

const MAX_SIDE_LENGTH = 60;

// "Kylian Mbappé" -> "kylian-mbappe". Digits are dropped, so a trailing
// number in a URL is always an id.
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[øæœßłđðþı]/g, (c) => LETTERS[c])
    .replace(/['’]/g, "")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
}

// BSD's full name ("Erling Haaland"), not the abbreviated "E. Haaland".
export function playerSlug(p: PlayerProfile) {
  return slugify([p.firstname, p.lastname].filter(Boolean).join(" ") || p.name);
}

export function sideSlug({ slug, id }: SideRef) {
  return id === null ? slug : `${slug}-${id}`;
}

export function matchupPath(left: string, right: string) {
  return `/compare/${left}-vs-${right}`;
}

function parseSide(text: string): SideRef | null {
  if (text.length > MAX_SIDE_LENGTH) return null;
  const [, name, id] = text.match(/^(.*?)(?:-(\d{1,8}))?$/)!;
  const slug = slugify(name);
  return slug ? { slug, id: id ? Number(id) : null } : null;
}

function decode(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

// "erling-haaland-vs-kylian-mbappe" -> both sides, or null if it isn't a
// matchup. The page receives the segment still percent-encoded ("mbapp%C3%A9").
export function parseMatchup(matchup: string): [SideRef, SideRef] | null {
  const parts = decode(matchup).toLowerCase().split("-vs-");
  if (parts.length !== 2) return null;
  const [left, right] = parts.map(parseSide);
  return left && right ? [left, right] : null;
}
