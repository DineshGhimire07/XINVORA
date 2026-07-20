export type CookieCategory = "necessary" | "analytics" | "marketing" | "personalization"

export type ConsentSource = "banner" | "preferences" | "checkout" | "account_settings" | "api" | "admin"

export type ConsentMethod = "accept_all" | "reject_optional" | "custom"

export interface SignedCookiePayload {
  schema: 1
  policyVersion: string
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
  timestamp: string
  method: ConsentMethod
  source: ConsentSource
  signature: string
}

export interface CookieConsentState {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
  policyVersion: string
  isConsentGiven: boolean
  consentGivenAt?: string
  method?: ConsentMethod
  source?: ConsentSource
}

export interface PrivacyCMPSettings {
  enabled: boolean
  currentPolicyVersion: string
  cookieExpiryDays: number
  bannerTitle: string
  bannerDescription: string
  privacyPolicyUrl: string
  termsUrl: string
  forceBanner: boolean
  bannerPosition: "bottom" | "top" | "center"
  bannerTheme: "luxury-dark" | "luxury-light" | "glassmorphism"
  enableAnalyticsCategory: boolean
  enableMarketingCategory: boolean
  enablePersonalizationCategory: boolean
  scriptFlags: {
    googleAnalytics: boolean
    metaPixel: boolean
    clarity: boolean
    tiktokPixel: boolean
    pinterestPixel: boolean
  }
}

export interface PolicyVersionSnapshot {
  version: string
  description: string
  publishedAt: string
  publishedBy?: string
  snapshot: {
    necessaryDesc: string
    analyticsDesc: string
    marketingDesc: string
    personalizationDesc: string
    dataRetentionDays: number
    legalJurisdiction: string
  }
}
