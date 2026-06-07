import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use webpack bundler (Turbopack requires native binaries not available on all platforms)
  experimental: {},
};

export default nextConfig;
