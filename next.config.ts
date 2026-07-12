import type { NextConfig } from "next";

/**
 * next.config.ts — XINVORA Next.js Configuration
 *
 * Production-grade config covering:
 * - Security headers (XSS, framing, MIME sniffing)
 * - Image optimization domains (future CDN / CMS)
 * - Strict mode for React 19
 * - Bundle analysis stub (enable via ANALYZE=true)
 * - Internationalization ready (matcher in middleware.ts)
 */
const nextConfig: NextConfig = {
  // React Strict Mode — catches double-invocation bugs in development
  reactStrictMode: true,

  // Image optimization — add CDN hostnames here as the project grows
  images: {
    remotePatterns: [
      // Placeholder for future image CDN (Cloudinary, Sanity, etc.)
      // { protocol: "https", hostname: "cdn.xinvora.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    // Curated device sizes aligned to our responsive breakpoints
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production (keep console.error)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Security headers applied to every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Experimental features — enable carefully in production
  experimental: {
    // optimizePackageImports speeds up cold starts for large icon/component libs
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
