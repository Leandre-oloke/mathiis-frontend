import type { NextConfig } from "next";

const remoteApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.mathiis.com/api/v1";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {},
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development" || !remoteApiUrl.startsWith("http")) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${remoteApiUrl}/:path*`,
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
