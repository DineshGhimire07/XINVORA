import { z } from "zod"

export const saveConsentSchema = z.object({
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  personalization: z.boolean().default(false),
  source: z.enum(["banner", "preferences", "checkout", "account_settings", "api", "admin"]).default("banner"),
  method: z.enum(["accept_all", "reject_optional", "custom"]).default("accept_all"),
  policyVersion: z.string().default("1.0"),
})

export const updateConsentSchema = saveConsentSchema.partial()

export const publishPolicyVersionSchema = z.object({
  version: z.string().min(1, "Version string is required"),
  description: z.string().min(5, "Description is required"),
  requiresReconsent: z.boolean().default(true),
  policySnapshot: z.object({
    necessaryDesc: z.string(),
    analyticsDesc: z.string(),
    marketingDesc: z.string(),
    personalizationDesc: z.string(),
    dataRetentionDays: z.number().default(365),
    legalJurisdiction: z.string().default("EU/GDPR Standard"),
  }),
})

export const updatePrivacyCMPSettingsSchema = z.object({
  enabled: z.boolean(),
  currentPolicyVersion: z.string(),
  cookieExpiryDays: z.number().min(1).max(365),
  bannerTitle: z.string(),
  bannerDescription: z.string(),
  privacyPolicyUrl: z.string(),
  termsUrl: z.string(),
  forceBanner: z.boolean(),
  bannerPosition: z.enum(["bottom", "top", "center"]),
  bannerTheme: z.enum(["luxury-dark", "luxury-light", "glassmorphism"]),
  enableAnalyticsCategory: z.boolean(),
  enableMarketingCategory: z.boolean(),
  enablePersonalizationCategory: z.boolean(),
  scriptFlags: z.object({
    googleAnalytics: z.boolean(),
    metaPixel: z.boolean(),
    clarity: z.boolean(),
    tiktokPixel: z.boolean(),
    pinterestPixel: z.boolean(),
  }),
})
