/**
 * constants/site.ts — XINVORA Site Configuration Constants
 *
 * URL, SEO defaults, Open Graph, and meta configuration.
 * Used by lib/metadata.ts to generate page metadata.
 * Import from here — never hardcode URLs or meta in components.
 */

import type { SeoMeta } from "@/types/common"
import { BRAND } from "./brand"

// ── Environment-aware URL ─────────────────────────────────────────────────────
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://xinvora.com"
    : "http://localhost:3000")

// ── Site Config ───────────────────────────────────────────────────────────────
export const SITE = {
  url: APP_URL,
  name: BRAND.name,
  title: `${BRAND.name} — Premium Lifestyle Brand`,
  titleTemplate: `%s | ${BRAND.name}`,
  description: BRAND.description,
  locale: "en_US",
  type: "website",
} as const

// ── Default SEO ───────────────────────────────────────────────────────────────
export const DEFAULT_SEO: SeoMeta = {
  title: SITE.title,
  description: BRAND.description,
  image: `${APP_URL}/assets/brand/social/og-default.jpg`,
  keywords: [
    "XINVORA",
    "premium lifestyle",
    "luxury brand",
    "fashion",
    "home decor",
    "considered design",
  ],
}

// ── Open Graph ────────────────────────────────────────────────────────────────
export const OG_CONFIG = {
  defaultImage: {
    url: `${APP_URL}/assets/brand/social/og-default.jpg`,
    width: 1200,
    height: 630,
    alt: `${BRAND.name} — ${BRAND.tagline}`,
  },
  twitterHandle: "@xinvora",
  twitterCardType: "summary_large_image" as const,
} as const

// ── Robots ────────────────────────────────────────────────────────────────────
export const ROBOTS_CONFIG = {
  index: true,
  follow: true,
  nocache: false,
} as const

// ── Verification ──────────────────────────────────────────────────────────────
// Add site verification tokens here when connecting search consoles
export const VERIFICATION = {
  // google: "your-google-verification-token",
  // yandex: "your-yandex-verification-token",
} as const

export { APP_URL }
