import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Player photos, badges and league logos from the BSD Image API.
    remotePatterns: [{ protocol: "https", hostname: "sports.bzzoiro.com", pathname: "/img/**" }],
  },
  // One privacy page; the short address people (and reviewers) try first
  // leads to it rather than serving a second copy.
  async redirects() {
    return [{ source: "/privacy", destination: "/privacy-policy", permanent: true }];
  },
};

export default nextConfig;
