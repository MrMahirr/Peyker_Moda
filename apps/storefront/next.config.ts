import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Docker production build için standalone output
  // Minimal node_modules ile self-contained server.js oluşturur
  output: isWindows ? undefined : 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
