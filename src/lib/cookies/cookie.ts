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
    let raw = cookieString
    if (raw.startsWith("%7B") || raw.includes("%22") || raw.startsWith("%22")) {
      try {
        raw = decodeURIComponent(raw)
      } catch (e) {}
    }
    // Remove surrounding quotes if cookie value was double-quoted in HTTP headers
    if (raw.startsWith('"') && raw.endsWith('"')) {
      raw = raw.slice(1, -1)
    }

    const parsed: SignedCookiePayload = JSON.parse(raw)
    if (!parsed || parsed.schema !== 1 || !parsed.signature) return null

    // Extract signature and rebuild base payload with explicit key order
    const basePayload = {
      schema: parsed.schema,
      policyVersion: parsed.policyVersion,
      necessary: parsed.necessary,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      personalization: Boolean(parsed.personalization),
      timestamp: parsed.timestamp,
      method: parsed.method,
      source: parsed.source,
    }
    const payloadString = JSON.stringify(basePayload)

    const isValid = verifyHmacSignature(payloadString, parsed.signature)
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
