/**
 * config/features.ts — XINVORA Feature Flags
 *
 * Controls which features are active in each environment.
 * Used for gradual rollout, A/B testing, and beta features.
 *
 * Usage:
 *   import { features } from "@/config/features"
 *   if (features.WISHLIST) { ... }
 *
 * Future: Replace with a proper feature flag service (LaunchDarkly, Statsig)
 * by changing only this file — all consumers remain unchanged.
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production"

// ── Feature Flag Definitions ──────────────────────────────────────────────────
export const features = {
  // ── Commerce ──────────────────────────────────────────────────────────────
  /** Product catalog and browsing */
  CATALOG: false,
  /** Shopping cart functionality */
  CART: false,
  /** Checkout and payment processing */
  CHECKOUT: false,
  /** Wishlist / saved items */
  WISHLIST: false,
  /** Product reviews and ratings */
  REVIEWS: false,

  // ── Account ───────────────────────────────────────────────────────────────
  /** User authentication (sign in / sign up) */
  AUTH: false,
  /** Customer account dashboard */
  ACCOUNT: false,
  /** Order history */
  ORDERS: false,

  // ── Marketing ─────────────────────────────────────────────────────────────
  /** Email newsletter subscription */
  NEWSLETTER: true,
  /** Promotional banners */
  PROMO_BANNER: false,
  /** Loyalty / rewards program */
  LOYALTY: false,

  // ── Content ───────────────────────────────────────────────────────────────
  /** Editorial journal / blog */
  JOURNAL: false,
  /** Search functionality */
  SEARCH: false,
  /** Product filtering */
  FILTERING: false,

  // ── Ops ───────────────────────────────────────────────────────────────────
  /** Analytics tracking */
  ANALYTICS: IS_PRODUCTION,
  /** Cookie consent banner */
  COOKIE_CONSENT: IS_PRODUCTION,
  /** Maintenance mode */
  MAINTENANCE_MODE: false,
  /** Debug panel (dev only) */
  DEBUG_PANEL: !IS_PRODUCTION,
} as const

export type FeatureFlag = keyof typeof features
export type Features = typeof features
