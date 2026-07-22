/**
 * constants/brand.ts — XINVORA Brand Identity Constants
 *
 * Single source of truth for all brand identity data.
 * Import from here — never hardcode brand values in components.
 */

import type { BrandIdentity, SocialLink, BrandLogo } from "@/types/brand"

// ── Brand Identity ────────────────────────────────────────────────────────────
export const BRAND: BrandIdentity = {
  name: "XINVORA",
  tagline: "Crafted for the way you live",
  description:
    "XINVORA is a premium lifestyle brand creating considered objects for modern living. From fashion to home, every piece is designed with intention — beautiful, functional, and built to last.",
  foundedYear: 2024,
  country: "Nepal",
  mission:
    "To create premium lifestyle objects that elevate everyday living through thoughtful design, exceptional materials, and timeless craft.",
} as const

// ── Logo Asset Paths ──────────────────────────────────────────────────────────
// These paths point to public/assets/brand/logos/ — drop in the files.
export const BRAND_LOGOS: BrandLogo = {
  dark: "/assets/brand/logos/logo_black.png",
  light: "/assets/brand/logos/logo_white.png",
  wordmark: "/assets/brand/logos/Wordmark.png",
  full: "/assets/brand/logos/Logo_Wordmark.png",
  accent: "/assets/brand/logos/Warm_taupe.png",
} as const

// ── Social Links ──────────────────────────────────────────────────────────────
export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "instagram",
    url: "https://instagram.com/xinvora",
    handle: "@xinvora",
  },
  {
    platform: "pinterest",
    url: "https://pinterest.com/xinvora",
    handle: "xinvora",
  },
  {
    platform: "twitter",
    url: "https://twitter.com/xinvora",
    handle: "@xinvora",
  },
] as const

// ── Contact ───────────────────────────────────────────────────────────────────
export const BRAND_CONTACT = {
  email: "hello@xinvora.com.np",
  supportEmail: "support@xinvora.com.np",
  pressEmail: "press@xinvora.com.np",
} as const

// ── Copyright ─────────────────────────────────────────────────────────────────
export const COPYRIGHT = `© ${new Date().getFullYear()} XINVORA. All rights reserved.`
