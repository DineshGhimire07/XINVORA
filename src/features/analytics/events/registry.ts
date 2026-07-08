import { z } from "zod"

export const AnalyticsEvent = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  SIGN_UP: "SIGN_UP",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PRODUCT_VIEW: "PRODUCT_VIEW",
  CATEGORY_VIEW: "CATEGORY_VIEW",
  SEARCH: "SEARCH",
  WISHLIST_ADD: "WISHLIST_ADD",
  WISHLIST_REMOVE: "WISHLIST_REMOVE",
  CART_ADD: "CART_ADD",
  CART_REMOVE: "CART_REMOVE",
  CHECKOUT_START: "CHECKOUT_START",
  CHECKOUT_ABANDON: "CHECKOUT_ABANDON",
  ORDER_COMPLETE: "ORDER_COMPLETE",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAIL: "PAYMENT_FAIL",
  COUPON_APPLY: "COUPON_APPLY",
  COUPON_REMOVE: "COUPON_REMOVE",
  REVIEW_SUBMIT: "REVIEW_SUBMIT",
  RETURN: "RETURN",
  PAGE_VIEW: "PAGE_VIEW",
} as const

export type AnalyticsEventType = typeof AnalyticsEvent[keyof typeof AnalyticsEvent]

export const DeviceType = {
  DESKTOP: "DESKTOP",
  MOBILE: "MOBILE",
  TABLET: "TABLET",
} as const

export type DeviceTypeType = typeof DeviceType[keyof typeof DeviceType]

// Zod schema to validate events sent to /api/analytics/event
export const IngestEventSchema = z.object({
  eventId: z.string().uuid(),
  sessionKey: z.string().min(1).max(255),
  userId: z.string().uuid().optional().nullable(),
  eventType: z.nativeEnum(AnalyticsEvent),
  
  productId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  orderId: z.string().uuid().optional().nullable(),
  
  page: z.string().min(1).max(2083),
  referrer: z.string().max(2083).optional().nullable(),
  device: z.nativeEnum(DeviceType),
  country: z.string().length(2).optional().nullable(),
  
  source: z.string().max(30).default("WEB"),
  payload: z.record(z.string(), z.any()).default({}),
  createdAt: z.string().datetime().optional().nullable(),
})

export type IngestEvent = z.infer<typeof IngestEventSchema>
