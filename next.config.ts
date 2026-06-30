import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Указываем подпапку, в которой живет проект на GitHub Pages
  basePath: '/Robobarista', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;