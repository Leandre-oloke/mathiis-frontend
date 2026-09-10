import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {},
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
