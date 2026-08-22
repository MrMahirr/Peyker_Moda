import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Docker production build için standalone output
  // Minimal node_modules ile self-contained server.js oluşturur
  output: isWindows ? undefined : 'standalone',

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
      }
    ],
  },
};

export default nextConfig;
