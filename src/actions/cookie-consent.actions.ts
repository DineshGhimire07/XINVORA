"use server"

import { CookieConsentService } from "@/services/cookie-consent.service"
import { saveConsentSchema, updatePrivacyCMPSettingsSchema, publishPolicyVersionSchema } from "@/validations/cookies"
import { cookies, headers } from "next/headers"
import { buildSignedCookieValue, CONSENT_COOKIE_NAME } from "@/lib/cookies/cookie"
import { SessionService } from "@/services/session.service"

export async function saveConsentAction(input: any) {
  try {
    const parsed = saveConsentSchema.parse(input)
    const { userId } = await SessionService.getCommerceIdentity()
    const headerList = await headers()

    const ipRaw = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1"
    const userAgent = headerList.get("user-agent") || ""

    const consentRecord = await CookieConsentService.saveConsent(userId, parsed, {
      ipRaw,
      userAgent,
    })

    // Set signed browser cookie
    const signedValue = buildSignedCookieValue(
      {
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        personalization: parsed.personalization,
      },
      parsed.policyVersion,
      parsed.source,
      parsed.method
    )

    const cookieStore = await cookies()
    cookieStore.set(CONSENT_COOKIE_NAME, signedValue, {
      path: "/",
      maxAge: 180 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return { success: true, data: consentRecord }
  } catch (err: any) {
    console.error("[saveConsentAction] Error:", err)
    return { success: false, error: { message: err.message || "Failed to save consent" } }
  }
}

export async function withdrawConsentAction(consentId?: string) {
  try {
    const { userId } = await SessionService.getCommerceIdentity()
    const headerList = await headers()
    const ipRaw = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1"
    const userAgent = headerList.get("user-agent") || ""

    if (consentId) {
      await CookieConsentService.withdrawConsent(consentId, userId || undefined, ipRaw, userAgent)
    }

    const cookieStore = await cookies()
    cookieStore.delete(CONSENT_COOKIE_NAME)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: { message: err.message || "Failed to withdraw consent" } }
  }
}

export async function updatePrivacyCMPSettingsAction(input: any) {
  try {
    const parsed = updatePrivacyCMPSettingsSchema.parse(input)
    const updated = await CookieConsentService.updatePrivacySettings(parsed)
    return { success: true, data: updated }
  } catch (err: any) {
    return { success: false, error: { message: err.message || "Failed to update privacy settings" } }
  }
}

export async function publishPolicyVersionAction(input: any) {
  try {
    const parsed = publishPolicyVersionSchema.parse(input)
    const { userId } = await SessionService.getCommerceIdentity()

    const published = await CookieConsentService.publishPolicyVersion({
      ...parsed,
      publishedBy: userId || undefined,
    })

    return { success: true, data: published }
  } catch (err: any) {
    return { success: false, error: { message: err.message || "Failed to publish policy version" } }
  }
}
