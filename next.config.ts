// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Это превращает проект в статический HTML/CSS/JS
  images: {
    unoptimized: true, // Нужно, так как стандартный Image компонент требует сервер для оптимизации
  },
};

export default nextConfig;