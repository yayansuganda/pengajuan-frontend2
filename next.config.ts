import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  skipTrailingSlashRedirect: true, // Don't redirect /path/ to /path
};

export default nextConfig;
