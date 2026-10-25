import type { MetadataRoute } from "next";
import { getPopularMatchups } from "@/lib/bsd/popular";
import { absoluteUrl } from "@/lib/site";

// Rebuilt daily, so newly resolvable players and name changes flow in.
export const revalidate = 86400;

// Only the curated head-to-heads (lib/popular-players.ts). Every other
// pairing stays browsable but is kept out of Google's index, so the site is
// judged on its strongest pages.
const priority = { iconic: 0.9, "same-role": 0.7 } as const;

// No lastModified: the only date available is the rebuild time, and a
// lastmod that changes daily for unchanged pages teaches Google to ignore it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/compare"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/rivalries"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/stats-guide"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const matchups = (await getPopularMatchups()).map(
    (m): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(m.path),
      changeFrequency: "weekly",
      priority: priority[m.kind],
      images: [m.left.player.photo, m.right.player.photo],
    }),
  );

  return [...pages, ...matchups];
}
