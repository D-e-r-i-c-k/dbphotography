import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow both direct Sanity CDN (for blur placeholders) and our own proxy
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
    // Prefer WebP for better compression + quality at the same file size
    formats: ["image/webp"],
    // Reduce default device sizes to avoid generating unnecessary large variants
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 days (they're immutable via content hash)
    minimumCacheTTL: 5184000,
  },
};

export default nextConfig;
