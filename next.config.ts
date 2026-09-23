import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Player photos, badges and league logos from the BSD Image API.
    remotePatterns: [{ protocol: "https", hostname: "sports.bzzoiro.com", pathname: "/img/**" }],
  },
};

export default nextConfig;
