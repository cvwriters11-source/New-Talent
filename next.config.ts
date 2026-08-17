import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [64, 96, 128, 256, 384],
  },
  serverExternalPackages: ["pdf-parse", "@react-pdf/renderer"],
  experimental: {
    optimizePackageImports: ["ai", "@ai-sdk/openai"],
  },
};

export default nextConfig;
