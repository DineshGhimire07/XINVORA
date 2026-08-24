import type { NextConfig } from "next";

/**
 * next.config.ts — XINVORA Next.js Configuration
 *
 * Production-grade config covering:
 * - Enterprise Security Headers (CSP, HSTS, X-Frame-Options, MIME sniffing)
 * - Image optimization domains (Cloudinary, Unsplash)
 * - Strict mode for React 19
 * - Compiler optimizations
 */

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://connect.facebook.net https://analytics.tiktok.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https: res.cloudinary.com images.unsplash.com placehold.co https://www.facebook.com https://*.clarity.ms https://www.google-analytics.com https://analytics.tiktok.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://www.facebook.com https://*.tiktok.com https://analytics.tiktok.com https://vitals.vercel-insights.com;
  media-src 'self' blob: https://res.cloudinary.com;
  worker-src 'self' blob:;
  frame-src 'self' https://www.facebook.com https://connect.facebook.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://res.cloudinary.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // React Strict Mode — catches double-invocation bugs in development
  reactStrictMode: true,

  // Image optimization — CDN hostnames, AVIF/WebP negotiation, and 1-year edge caching
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Enterprise Security Headers applied to every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
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

  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
