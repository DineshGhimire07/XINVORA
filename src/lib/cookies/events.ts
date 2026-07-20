import type { CookieConsentState } from "@/types/cookies"

export const CONSENT_UPDATED_EVENT = "XINVORA_CONSENT_UPDATED"

export type CMPEventType =
  | "CONSENT_CREATED"
  | "CONSENT_UPDATED"
  | "CONSENT_WITHDRAWN"
  | "POLICY_PUBLISHED"
  | "GUEST_SYNCED"

export interface CMPEventData {
  type: CMPEventType
  state: CookieConsentState
  timestamp: string
}

export function emitCMPEvent(type: CMPEventType, state: CookieConsentState) {
  if (typeof window === "undefined") return

  const payload: CMPEventData = {
    type,
    state,
    timestamp: new Date().toISOString(),
  }

  const customEvent = new CustomEvent(CONSENT_UPDATED_EVENT, { detail: payload })
  window.dispatchEvent(customEvent)
}
