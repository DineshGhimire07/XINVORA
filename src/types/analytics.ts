export type EventName =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "CATEGORY_VIEW"
  | "SEARCH"
  | "FILTER_CHANGE"
  | "SORT_CHANGE"
  | "SIZE_SELECTED"
  | "COLOR_SELECTED"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "START_CHECKOUT"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "LOGIN"
  | "REGISTER"
  | "NEWSLETTER_SUBSCRIBE"
  | "WISHLIST_ADD"
  | "WISHLIST_REMOVE"
  | "RECOMMENDATION_CLICK"

export interface AnalyticsEventPayload {
  eventName: EventName
  correlationId?: string
  version?: number
  page?: string
  path?: string
  productId?: string
  categoryId?: string
  collectionId?: string
  device?: string
  browser?: string
  os?: string
  country?: string
  language?: string
  currency?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
  metadata?: Record<string, any>
}

export interface CDPMetricsResponse {
  revenue: {
    grossRevenue: number
    netRevenue: number
    aov: number
    refundRate: number
  }
  conversion: {
    visitors: number
    productViews: number
    addToCartCount: number
    checkoutStartedCount: number
    purchasesCount: number
    funnelConversionRate: number
  }
  merchandising: {
    topViewedProducts: Array<{ id: string; name: string; views: number }>
    topPurchasedProducts: Array<{ id: string; name: string; orders: number; revenue: number }>
  }
  search: {
    topQueries: Array<{ query: string; count: number; conversionRate: number }>
  }
  privacy: {
    totalConsents: number
    analyticsOptInRate: number
    marketingOptInRate: number
    personalizationOptInRate: number
  }
}
