import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Player photos, badges and league logos from the BSD Image API.
    remotePatterns: [{ protocol: "https", hostname: "sports.bzzoiro.com", pathname: "/img/**" }],
  },
  // One privacy page; the short address people (and reviewers) try first
  // leads to it rather than serving a second copy.
  async redirects() {
    return [
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      // The site began as a single Haaland vs Mbappé page at /haalandvsmbappe
      // (and on the haalandvsmbappe. subdomain, redirected in Nginx). Send
      // that history to the comparison it became instead of a 404.
      {
        source: "/haalandvsmbappe/:path*",
        destination: "/compare/erling-haaland-vs-kylian-mbappe",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
