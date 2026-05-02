import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'placehold.co'],
  },
};

export default nextConfig;
