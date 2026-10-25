import type { MetadataRoute } from "next";
import { getPopularMatchups } from "@/lib/bsd/popular";
import { absoluteUrl } from "@/lib/site";

// Rebuilt daily, so newly resolvable players and name changes flow in.
export const revalidate = 86400;

// Iconic and same-position pairs are the ones fans search for. Mixed
// positions (a keeper against a striker) stay browsable but are left out
// here and marked noindex, so search engines judge the site on its
// strongest pages.
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

  const matchups = (await getPopularMatchups()).flatMap(
    (m): MetadataRoute.Sitemap =>
      m.kind === "cross-role"
        ? []
        : [
            {
              url: absoluteUrl(m.path),
              changeFrequency: "weekly",
              priority: priority[m.kind],
              images: [m.left.player.photo, m.right.player.photo],
            },
          ],
  );

  return [...pages, ...matchups];
}
