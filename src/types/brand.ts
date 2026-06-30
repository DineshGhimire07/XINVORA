/**
 * types/brand.ts — XINVORA Brand Domain Types
 *
 * Generic lifestyle brand types. Intentionally NOT specific to clothing.
 * These types support any product category: Fashion, Home, Kitchen,
 * Bathroom, Travel, Office, Accessories, Lifestyle.
 *
 * No ecommerce-specific types here — those belong in features/catalog.
 */

// ── Brand Categories ──────────────────────────────────────────────────────────
// Extensible union — add new categories without breaking existing code
export type ProductCategory =
  | "fashion"
  | "home"
  | "kitchen"
  | "bathroom"
  | "travel"
  | "office"
  | "accessories"
  | "lifestyle"

// ── Brand Identity ────────────────────────────────────────────────────────────
export interface BrandIdentity {
  name: string
  tagline: string
  description: string
  foundedYear: number
  country: string
  mission: string
}

// ── Social Link ───────────────────────────────────────────────────────────────
export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "pinterest"
  | "tiktok"
  | "youtube"
  | "linkedin"

export interface SocialLink {
  platform: SocialPlatform
  url: string
  handle: string
}

// ── Brand Assets ──────────────────────────────────────────────────────────────
export interface BrandLogo {
  /** Dark version — use on light backgrounds */
  dark: string
  /** Light version — use on dark backgrounds */
  light: string
  /** Wordmark only (text) */
  wordmark: string
  /** Combined logo + wordmark */
  full: string
  /** Warm taupe accent version */
  accent: string
}

// ── Content ───────────────────────────────────────────────────────────────────
export interface EditorialContent {
  title: string
  subtitle?: string
  body: string
  publishedAt: Date
  author?: string
  category?: ProductCategory
  tags?: string[]
  coverImage?: import("./common").ImageAsset
  slug: string
}

// ── Brand Values ──────────────────────────────────────────────────────────────
export interface BrandValue {
  id: string
  title: string
  description: string
  icon?: string
}

// ── Locale / Region ───────────────────────────────────────────────────────────
export type SupportedLocale = "en" | "en-US" | "en-GB"
export type SupportedCurrency = "USD" | "GBP" | "EUR" | "AUD" | "NPR"
export type SupportedRegion = "US" | "GB" | "EU" | "AU" | "NP"
