import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // WAJIB untuk Enterprise
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Allow camera & storage access for all pages (needed for Flutter WebView)
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
