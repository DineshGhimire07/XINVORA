import { db } from "@/db/client"
import { cookieConsents, cookieConsentAuditLogs, cookiePolicyVersions } from "@/db/schema/cookie-consent"
import { eq, and, desc, sql, count, isNull } from "drizzle-orm"
import type { CookieConsentState, ConsentSource, ConsentMethod, PrivacyCMPSettings } from "@/types/cookies"
import { appSettings } from "@/db/schema/settings"

export class CookieConsentRepository {
  static async findByUserId(userId: string) {
    const records = await db
      .select()
      .from(cookieConsents)
      .where(and(eq(cookieConsents.userId, userId), eq(cookieConsents.isActive, true), isNull(cookieConsents.deletedAt)))
      .orderBy(desc(cookieConsents.updatedAt))
      .limit(1)

    return records[0] || null
  }

  static async createConsent(data: {
    userId?: string | null
    consentVersion: string
    necessary: boolean
    analytics: boolean
    marketing: boolean
    personalization: boolean
    consentSource: ConsentSource
    consentMethod: ConsentMethod
    ipHash?: string
    userAgent?: string
    country?: string
    region?: string
  }) {
    return await db.transaction(async (tx) => {
      // Deactivate existing consents for user if logged in
      if (data.userId) {
        await tx
          .update(cookieConsents)
          .set({ isActive: false, updatedAt: new Date() })
          .where(and(eq(cookieConsents.userId, data.userId), eq(cookieConsents.isActive, true)))
      }

      const [newRecord] = await tx
        .insert(cookieConsents)
        .values({
          userId: data.userId || null,
          consentVersion: data.consentVersion,
          necessary: data.necessary,
          analytics: data.analytics,
          marketing: data.marketing,
          personalization: data.personalization,
          consentSource: data.consentSource,
          consentMethod: data.consentMethod,
          ipHash: data.ipHash,
          userAgent: data.userAgent,
          country: data.country,
          region: data.region,
          isActive: true,
        })
        .returning()

      // Log Audit Entry
      await tx.insert(cookieConsentAuditLogs).values({
        consentId: newRecord.id,
        userId: data.userId || null,
        oldValues: null,
        newValues: {
          analytics: data.analytics,
          marketing: data.marketing,
          personalization: data.personalization,
          consentVersion: data.consentVersion,
        },
        action: "CREATE",
        ipHash: data.ipHash,
        userAgent: data.userAgent,
      })

      return newRecord
    })
  }

  static async withdrawConsent(id: string, userId?: string, ipHash?: string, userAgent?: string) {
    return await db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(cookieConsents)
        .where(eq(cookieConsents.id, id))
        .limit(1)

      if (!record) return null

      const [updated] = await tx
        .update(cookieConsents)
        .set({
          isActive: false,
          withdrawnAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(cookieConsents.id, id))
        .returning()

      // Audit log
      await tx.insert(cookieConsentAuditLogs).values({
        consentId: id,
        userId: userId || null,
        oldValues: { analytics: record.analytics, marketing: record.marketing, personalization: record.personalization },
        newValues: { withdrawn: true },
        action: "WITHDRAW",
        ipHash,
        userAgent,
      })

      return updated
    })
  }

  static async getAuditLogs(limit: number = 50) {
    return await db
      .select()
      .from(cookieConsentAuditLogs)
      .orderBy(desc(cookieConsentAuditLogs.createdAt))
      .limit(limit)
  }

  static async getPolicyVersions() {
    return await db
      .select()
      .from(cookiePolicyVersions)
      .orderBy(desc(cookiePolicyVersions.publishedAt))
  }

  static async publishPolicyVersion(data: {
    version: string
    description: string
    policySnapshot: any
    requiresReconsent: boolean
    publishedBy?: string
  }) {
    const [published] = await db
      .insert(cookiePolicyVersions)
      .values({
        version: data.version,
        description: data.description,
        policySnapshot: data.policySnapshot,
        requiresReconsent: data.requiresReconsent,
        publishedBy: data.publishedBy || null,
      })
      .returning()

    return published
  }

  static async getPrivacySettings(): Promise<PrivacyCMPSettings> {
    const records = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "privacy_cookies"))
      .limit(1)

    if (records.length === 0 || !records[0].value) {
      return {
        enabled: true,
        currentPolicyVersion: "1.0",
        cookieExpiryDays: 180,
        bannerTitle: "WE VALUE YOUR PRIVACY",
        bannerDescription: "We use cookies to tailor your browsing experience, deliver personalized recommendations, and analyze site traffic for quiet luxury.",
        privacyPolicyUrl: "/privacy",
        termsUrl: "/terms",
        forceBanner: false,
        bannerPosition: "bottom",
        bannerTheme: "luxury-dark",
        enableAnalyticsCategory: true,
        enableMarketingCategory: true,
        enablePersonalizationCategory: true,
        scriptFlags: {
          googleAnalytics: true,
          metaPixel: true,
          clarity: true,
          tiktokPixel: true,
          pinterestPixel: false,
        },
      }
    }

    return records[0].value as PrivacyCMPSettings
  }

  static async updatePrivacySettings(settings: PrivacyCMPSettings) {
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "privacy_cookies"))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(appSettings)
        .set({ value: settings as any, updatedAt: new Date() })
        .where(eq(appSettings.key, "privacy_cookies"))
    } else {
      await db.insert(appSettings).values({
        key: "privacy_cookies",
        value: settings as any,
      })
    }

    return settings
  }

  static async getOptInStats() {
    const [total] = await db.select({ val: count() }).from(cookieConsents)
    const [analytics] = await db.select({ val: count() }).from(cookieConsents).where(eq(cookieConsents.analytics, true))
    const [marketing] = await db.select({ val: count() }).from(cookieConsents).where(eq(cookieConsents.marketing, true))
    const [personalization] = await db.select({ val: count() }).from(cookieConsents).where(eq(cookieConsents.personalization, true))

    const totalCount = total?.val || 1

    return {
      totalConsents: totalCount,
      analyticsOptInRate: Math.round(((analytics?.val || 0) / totalCount) * 100),
      marketingOptInRate: Math.round(((marketing?.val || 0) / totalCount) * 100),
      personalizationOptInRate: Math.round(((personalization?.val || 0) / totalCount) * 100),
    }
  }
}
