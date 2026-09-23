import "server-only";

import { cache } from "react";
import { iconicRivalries, popularPlayers, type PopularPlayer } from "@/lib/popular-players";
import { matchupPath, playerSlug, slugify } from "@/lib/player-slug";
import type { PlayerProfile } from "@/lib/player-stats";
import { hasApiKey } from "./client";
import { canonicalSide, findPlayerBySlug } from "./matchup";
import { searchPlayers } from "./players";

// The popular players looked up in BSD, and every comparison between them.
// A name only makes it in when it leads to a real player, and each URL uses
// the player's canonical slug, so it opens the comparison without a redirect.

export type ResolvedPlayer = PopularPlayer & { slug: string; player: PlayerProfile };

export type PopularMatchup = {
  path: string;
  left: ResolvedPlayer;
  right: ResolvedPlayer;
  kind: "iconic" | "same-role" | "cross-role";
};

export const resolvePopularPlayers = cache(async (): Promise<ResolvedPlayer[]> => {
  if (!hasApiKey()) return [];

  const resolved = await Promise.all(
    popularPlayers.map(async (entry) => {
      try {
        const slug = slugify(entry.name);
        const byName = await findPlayerBySlug(slug);
        if (byName) return { ...entry, slug: playerSlug(byName), player: byName };

        // Names the slug lookup can't find ("Trent Alexander-Arnold") still
        // have a page, under their name plus id.
        const player = (await searchPlayers(entry.name)).find((p) => playerSlug(p) === slug);
        return player ? { ...entry, slug: await canonicalSide(player), player } : null;
      } catch {
        // Quota or network trouble: leave the player out this time round.
        return null;
      }
    }),
  );
  return resolved.filter((p) => p !== null);
});

export const getPopularMatchups = cache(async (): Promise<PopularMatchup[]> => {
  const players = await resolvePopularPlayers();
  const byName = new Map(players.map((p) => [p.name, p]));
  const seen = new Set<string>();
  const matchups: PopularMatchup[] = [];

  const add = (left: ResolvedPlayer, right: ResolvedPlayer, kind: PopularMatchup["kind"]) => {
    // One URL per pair: the swapped order is the same comparison.
    const key = [left.player.id, right.player.id].sort((a, b) => a - b).join("-");
    if (left.player.id === right.player.id || seen.has(key)) return;
    seen.add(key);
    matchups.push({ path: matchupPath(left.slug, right.slug), left, right, kind });
  };

  for (const [a, b] of iconicRivalries) {
    const left = byName.get(a);
    const right = byName.get(b);
    if (left && right) add(left, right, "iconic");
  }

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const [left, right] = [players[i], players[j]];
      add(left, right, left.role === right.role ? "same-role" : "cross-role");
    }
  }

  return matchups;
});
