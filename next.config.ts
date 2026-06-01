import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:filename",
        destination: "/api/uploads/:filename",
      },
    ];
  },
};

export default nextConfig;
