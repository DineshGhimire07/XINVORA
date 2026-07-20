import { CookieConsentRepository } from "@/repositories/cookie-consent.repository"
import type { CookieConsentState, ConsentSource, ConsentMethod, PrivacyCMPSettings } from "@/types/cookies"
import { hashIpAddress } from "@/lib/cookies/signatures"

export class CookieConsentService {
  static async saveConsent(
    userId: string | null,
    data: {
      analytics?: boolean
      marketing?: boolean
      personalization?: boolean
      policyVersion?: string
      source?: ConsentSource
      method?: ConsentMethod
    },
    reqInfo?: { ipRaw?: string; userAgent?: string; country?: string; region?: string }
  ) {
    const ipHash = hashIpAddress(reqInfo?.ipRaw)

    return await CookieConsentRepository.createConsent({
      userId,
      consentVersion: data.policyVersion || "1.0",
      necessary: true,
      analytics: Boolean(data.analytics),
      marketing: Boolean(data.marketing),
      personalization: Boolean(data.personalization),
      consentSource: data.source || "banner",
      consentMethod: data.method || "accept_all",
      ipHash,
      userAgent: reqInfo?.userAgent,
      country: reqInfo?.country,
      region: reqInfo?.region,
    })
  }

  static async getConsent(userId: string) {
    return await CookieConsentRepository.findByUserId(userId)
  }

  static async withdrawConsent(consentId: string, userId?: string, ipRaw?: string, userAgent?: string) {
    const ipHash = hashIpAddress(ipRaw)
    return await CookieConsentRepository.withdrawConsent(consentId, userId, ipHash, userAgent)
  }

  static async syncGuestConsentToUser(userId: string, guestCookiePayload: any, ipRaw?: string, userAgent?: string) {
    if (!guestCookiePayload) return null

    const ipHash = hashIpAddress(ipRaw)

    return await CookieConsentRepository.createConsent({
      userId,
      consentVersion: guestCookiePayload.policyVersion || "1.0",
      necessary: true,
      analytics: Boolean(guestCookiePayload.analytics),
      marketing: Boolean(guestCookiePayload.marketing),
      personalization: Boolean(guestCookiePayload.personalization),
      consentSource: "account_settings",
      consentMethod: guestCookiePayload.method || "custom",
      ipHash,
      userAgent,
    })
  }

  static async getPrivacySettings() {
    return await CookieConsentRepository.getPrivacySettings()
  }

  static async updatePrivacySettings(settings: PrivacyCMPSettings) {
    return await CookieConsentRepository.updatePrivacySettings(settings)
  }

  static async publishPolicyVersion(data: {
    version: string
    description: string
    policySnapshot: any
    requiresReconsent: boolean
    publishedBy?: string
  }) {
    return await CookieConsentRepository.publishPolicyVersion(data)
  }

  static async getAuditLogs(limit?: number) {
    return await CookieConsentRepository.getAuditLogs(limit)
  }

  static async getPolicyVersions() {
    return await CookieConsentRepository.getPolicyVersions()
  }
}
