import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
};

export default nextConfig;
