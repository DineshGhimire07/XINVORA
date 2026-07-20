import type { SignedCookiePayload, CookieConsentState, ConsentSource, ConsentMethod } from "@/types/cookies"
import { generateHmacSignature, verifyHmacSignature } from "./signatures"

export const CONSENT_COOKIE_NAME = "xinvora-consent"
export const DEFAULT_CONSENT_VERSION = "1.0"
export const DEFAULT_EXPIRY_DAYS = 180

export function buildSignedCookieValue(
  state: Partial<CookieConsentState>,
  version: string = DEFAULT_CONSENT_VERSION,
  source: ConsentSource = "banner",
  method: ConsentMethod = "accept_all"
): string {
  const timestamp = new Date().toISOString()
  const basePayload = {
    schema: 1 as const,
    policyVersion: version,
    necessary: true,
    analytics: Boolean(state.analytics),
    marketing: Boolean(state.marketing),
    personalization: Boolean(state.personalization),
    timestamp,
    method,
    source,
  }

  const payloadString = JSON.stringify(basePayload)
  const signature = generateHmacSignature(payloadString)

  const signedPayload: SignedCookiePayload = {
    ...basePayload,
    signature,
  }

  return JSON.stringify(signedPayload)
}

export function parseAndVerifySignedCookie(cookieString?: string | null): SignedCookiePayload | null {
  if (!cookieString) return null

  try {
    const parsed: SignedCookiePayload = JSON.parse(cookieString)
    if (!parsed || parsed.schema !== 1 || !parsed.signature) return null

    // Extract signature and rebuild base payload
    const { signature, ...basePayload } = parsed
    const payloadString = JSON.stringify(basePayload)

    const isValid = verifyHmacSignature(payloadString, signature)
    if (!isValid) {
      console.warn("[CookieConsent] Tampered or invalid signature detected on consent cookie.")
      return null
    }

    return parsed
  } catch (err) {
    console.error("[CookieConsent] Failed to parse cookie JSON:", err)
    return null
  }
}
