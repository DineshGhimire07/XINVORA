import { SessionService } from "@/services/session.service"
import { CookieConsentService } from "@/services/cookie-consent.service"
import { PrivacySettingsClient } from "./PrivacySettingsClient"

export const metadata = {
  title: "Privacy & Cookies Settings | Admin | XINVORA",
}

export default async function PrivacySettingsPage() {
  await SessionService.requireAdmin()

  let settings = null
  let auditLogs: any[] = []
  let policyVersions: any[] = []

  try {
    const [fetchedSettings, fetchedLogs, fetchedVersions] = await Promise.all([
      CookieConsentService.getPrivacySettings(),
      CookieConsentService.getAuditLogs(30),
      CookieConsentService.getPolicyVersions(),
    ])

    settings = fetchedSettings
    auditLogs = fetchedLogs || []
    policyVersions = fetchedVersions || []
  } catch (error) {
    console.error("[PrivacySettingsPage] Error fetching consent settings:", error)
  }

  if (!settings) {
    settings = {
      enabled: true,
      currentPolicyVersion: "1.0",
      cookieExpiryDays: 180,
      bannerTitle: "WE VALUE YOUR PRIVACY",
      bannerDescription: "We use cookies to tailor your browsing experience, deliver personalized recommendations, and analyze site traffic for quiet luxury.",
      privacyPolicyUrl: "/privacy",
      termsUrl: "/terms",
      forceBanner: false,
      bannerPosition: "bottom" as const,
      bannerTheme: "luxury-dark" as const,
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

  return (
    <PrivacySettingsClient
      initialSettings={settings}
      initialAuditLogs={auditLogs}
      initialPolicyVersions={policyVersions}
    />
  )
}
