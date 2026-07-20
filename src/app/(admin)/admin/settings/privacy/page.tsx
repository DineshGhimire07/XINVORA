import { CookieConsentService } from "@/services/cookie-consent.service"
import { PrivacySettingsClient } from "./PrivacySettingsClient"

export default async function PrivacySettingsPage() {
  const [settings, auditLogs, policyVersions] = await Promise.all([
    CookieConsentService.getPrivacySettings(),
    CookieConsentService.getAuditLogs(30),
    CookieConsentService.getPolicyVersions(),
  ])

  return (
    <PrivacySettingsClient
      initialSettings={settings}
      initialAuditLogs={auditLogs as any}
      initialPolicyVersions={policyVersions as any}
    />
  )
}
