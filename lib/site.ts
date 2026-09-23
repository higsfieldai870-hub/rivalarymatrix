// Site-wide constants for metadata, the sitemap and robots.txt.

export const SITE_NAME = "Rivalry Matrix";

export const SITE_DESCRIPTION =
  "Football's biggest rivalries settled with data: career numbers, season-by-season charts, per-90 efficiency and trophy cabinets, side by side.";

// The public origin, without a trailing slash, used for canonical URLs, the
// sitemap and robots.txt. NEXT_PUBLIC_SITE_URL overrides it (e.g. staging).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rivalrymetrics.com").replace(
  /\/+$/,
  "",
);

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

// A page's `openGraph` replaces the layout's rather than merging with it,
// so every page builds the whole block from here.
export function openGraph(url: string, title: string, description: string) {
  return {
    type: "website" as const,
    siteName: SITE_NAME,
    locale: "en_GB",
    url,
    title,
    description,
  };
}
