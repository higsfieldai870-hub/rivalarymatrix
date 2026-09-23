import type { MetadataRoute } from "next";
import { getPopularMatchups } from "@/lib/bsd/popular";
import { absoluteUrl } from "@/lib/site";

// Rebuilt daily, so newly resolvable players and name changes flow in.
export const revalidate = 86400;

const priority = { iconic: 0.9, "same-role": 0.7, "cross-role": 0.5 } as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/compare"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/rivalries"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/live"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const matchups = (await getPopularMatchups()).map(
    (m): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(m.path),
      lastModified: now,
      changeFrequency: "weekly",
      priority: priority[m.kind],
      images: [m.left.player.photo, m.right.player.photo],
    }),
  );

  return [...pages, ...matchups];
}
