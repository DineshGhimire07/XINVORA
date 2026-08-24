import { z } from "zod"

// ── Canonical event registry (Pipeline 1 only) ───────────────────────────────
// These are the ONLY valid event names in XINVORA analytics.
// Do NOT add aliases such as ADD_TO_CART, REMOVE_FROM_CART, START_CHECKOUT,
// or PAYMENT_FAILED — use the names below.

export const AnalyticsEvent = {
  // ── Identity / Operational (bypass analytics consent gate) ──────────────
  LOGIN:           "LOGIN",
  LOGOUT:          "LOGOUT",
  SIGN_UP:         "SIGN_UP",
  PROFILE_UPDATE:  "PROFILE_UPDATE",

  // ── Navigation (requires analytics consent) ──────────────────────────────
  PAGE_VIEW:       "PAGE_VIEW",
  COLLECTION_VIEW: "COLLECTION_VIEW", // Collections ≠ categories in XINVORA
  CATEGORY_VIEW:   "CATEGORY_VIEW",   // Category-taxonomy navigation

  // ── Discovery (requires analytics consent) ───────────────────────────────
  SEARCH:              "SEARCH",
  FILTER_CHANGE:       "FILTER_CHANGE",       // Phase 3
  SORT_CHANGE:         "SORT_CHANGE",         // Phase 3
  RECOMMENDATION_CLICK:"RECOMMENDATION_CLICK",// Phase 3 (personalization consent)

  // ── Product interaction (analytics + personalization consent) ────────────
  PRODUCT_VIEW:    "PRODUCT_VIEW",
  SIZE_SELECTED:   "SIZE_SELECTED",   // Phase 2 (personalization consent)
  COLOR_SELECTED:  "COLOR_SELECTED",  // Phase 2 (personalization consent)
  GALLERY_OPEN:    "GALLERY_OPEN",    // Phase 3
  GALLERY_SWIPE:   "GALLERY_SWIPE",   // Phase 3

  // ── Commerce (requires analytics consent) ────────────────────────────────
  WISHLIST_ADD:     "WISHLIST_ADD",
  WISHLIST_REMOVE:  "WISHLIST_REMOVE",
  CART_ADD:         "CART_ADD",
  CART_REMOVE:      "CART_REMOVE",
  CHECKOUT_START:   "CHECKOUT_START",
  CHECKOUT_ABANDON: "CHECKOUT_ABANDON",
  ORDER_COMPLETE:   "ORDER_COMPLETE",
  PAYMENT_SUCCESS:  "PAYMENT_SUCCESS",
  PAYMENT_FAIL:     "PAYMENT_FAIL",
  COUPON_APPLY:     "COUPON_APPLY",
  COUPON_REMOVE:    "COUPON_REMOVE",
  REVIEW_SUBMIT:    "REVIEW_SUBMIT",
  RETURN:           "RETURN",
} as const

export type AnalyticsEventType = typeof AnalyticsEvent[keyof typeof AnalyticsEvent]

export const DeviceType = {
  DESKTOP: "DESKTOP",
  MOBILE:  "MOBILE",
  TABLET:  "TABLET",
} as const

export type DeviceTypeType = typeof DeviceType[keyof typeof DeviceType]

/**
 * IngestEventSchema — Zod schema for events received at POST /api/analytics/event.
 *
 * First-class dimension columns (justified by query patterns):
 *   productId    — existing, JOINed in product analytics queries
 *   categoryId   — existing, category-level analytics
 *   orderId      — existing, order attribution
 *   collectionId — NEW: collection analytics queries (GROUP BY, COUNT)
 *   variantId    — NEW: variant-level behavioral analytics (cart abandonment)
 *
 * NOT first-class (kept in JSONB payload.metadata):
 *   anonymousId  — tracked at session level via user_sessions.anonymous_id
 *   priceAtTime  — reference only; financial truth is orders/order_items
 *   cartValue    — context metadata; not queried directly
 *   searchQuery  — tracked via payload.query on SEARCH events → search_queries table
 */
export const IngestEventSchema = z.object({
  eventId:      z.string().uuid(),
  sessionKey:   z.string().min(1).max(255),
  userId:       z.string().uuid().optional().nullable(),
  eventType:    z.nativeEnum(AnalyticsEvent),

  // ── Dimension columns (first-class) ───────────────────────────────────────
  productId:    z.string().uuid().optional().nullable(),
  categoryId:   z.string().uuid().optional().nullable(),
  orderId:      z.string().uuid().optional().nullable(),
  collectionId: z.string().uuid().optional().nullable(), // NEW — Phase 2
  variantId:    z.string().uuid().optional().nullable(), // NEW — Phase 2

  // ── Context ───────────────────────────────────────────────────────────────
  page:     z.string().min(1).max(2083),
  referrer: z.string().max(2083).optional().nullable(),
  device:   z.nativeEnum(DeviceType),
  country:  z.string().length(2).optional().nullable(),

  source:  z.string().max(30).default("WEB"),
  payload: z.record(z.string(), z.any()).default({}),
  createdAt: z.string().datetime().optional().nullable(),
})

export type IngestEvent = z.infer<typeof IngestEventSchema>
