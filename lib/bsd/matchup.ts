import "server-only";

import { cache } from "react";
import { matchupPath, parseMatchup, playerSlug, sideSlug, type SideRef } from "@/lib/player-slug";
import type { PlayerProfile } from "@/lib/player-stats";
import { describeApiError } from "./client";
import { getProfile, searchPlayers } from "./players";

// Turns /compare/<left>-vs-<right> into two players, and two players into
// that URL. Both directions use the same lookup, so every URL built here
// leads back to the players it was built from.

// The best-known player whose full name has this slug. Search results are
// already ordered by market value.
export const findPlayerBySlug = cache(async (slug: string) => {
  const match = (players: PlayerProfile[]) => players.find((p) => playerSlug(p) === slug) ?? null;
  const found = match(await searchPlayers(slug.replaceAll("-", " ")));
  if (found) return found;

  // Names like "N'Golo Kanté" or "Djemba-Mbappé" don't survive the slug as
  // typed, so retry with the longest word (the later one on a tie).
  const word = slug.split("-").reduce((a, b) => (b.length >= a.length ? b : a));
  return word.length >= 3 && word !== slug ? match(await searchPlayers(word)) : null;
});

// Just the name when it leads back to this player, otherwise name and id.
export async function canonicalSide(player: PlayerProfile) {
  const slug = playerSlug(player);
  const top = await findPlayerBySlug(slug);
  return sideSlug({ slug, id: top?.id === player.id ? null : player.id });
}

function resolveSide({ slug, id }: SideRef) {
  return id === null ? findPlayerBySlug(slug) : getProfile(id);
}

export async function comparisonPath(leftId: number, rightId: number) {
  const [left, right] = await Promise.all([getProfile(leftId), getProfile(rightId)]);
  if (!left || !right) return null;
  const [a, b] = await Promise.all([canonicalSide(left), canonicalSide(right)]);
  return matchupPath(a, b);
}

export type Matchup =
  | { status: "invalid" }
  | { status: "ok"; left: PlayerProfile; right: PlayerProfile; path: string; swapPath: string }
  | { status: "missing"; names: string[] }
  | { status: "error"; message: string };

export const resolveMatchup = cache(async (matchup: string): Promise<Matchup> => {
  const sides = parseMatchup(matchup);
  if (!sides) return { status: "invalid" };

  try {
    const [left, right] = await Promise.all(sides.map(resolveSide));
    if (!left || !right) {
      const names = sides.filter((_, i) => ![left, right][i]).map((s) => s.slug.replaceAll("-", " "));
      return { status: "missing", names };
    }
    const [a, b] = await Promise.all([canonicalSide(left), canonicalSide(right)]);
    return { status: "ok", left, right, path: matchupPath(a, b), swapPath: matchupPath(b, a) };
  } catch (error) {
    return { status: "error", message: describeApiError(error) };
  }
});
