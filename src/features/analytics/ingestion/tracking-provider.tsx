"use client"

/**
 * features/analytics/ingestion/tracking-provider.tsx
 *
 * IDENTITY MODEL:
 *   anonymousId  — persistent browser cookie (xinvora_anon_id), 1-year expiry.
 *                  Identifies the same browser across sessions.
 *   sessionKey   — localStorage UUID (xinvora_session_key).
 *                  One per browsing session. Many sessions per anonymousId.
 *   userId       — NextAuth JWT user ID. Null until login.
 *
 * CONSENT GATE:
 *   trackEvent() checks analytics consent from CookieProvider before sending
 *   any behavioral analytics. Operational identity events (LOGIN, LOGOUT,
 *   SIGN_UP, PROFILE_UPDATE) bypass the gate — they are not behavioral
 *   analytics.
 *
 * ACCOUNT-SWITCH SAFETY:
 *   When a DIFFERENT user logs in (prevUserId ≠ newUserId, both non-null),
 *   a new sessionKey is generated. This prevents Person B from inheriting
 *   Person A's session row in user_sessions.
 *   When the SAME user re-logs in (prevUserId === newUserId), no rotation.
 *   When transitioning from anonymous to authenticated (prevUserId = null),
 *   no rotation — this is identity elevation, not a switch.
 */

import React, { createContext, useContext, useEffect, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AnalyticsEvent, AnalyticsEventType } from "../events/registry"
import { useCookieConsent } from "@/components/cookies/CookieProvider"
import { getOrCreateAnonymousId } from "@/lib/analytics/anonymous"

// ── Consent configuration ───────────────────────────────────────────────────

/**
 * Events that are operational/identity events and bypass the analytics
 * consent gate. These are NOT behavioral tracking events.
 *
 * NOTE: CHECKOUT_START, ORDER_COMPLETE, PAYMENT_SUCCESS, PAYMENT_FAIL are
 * intentionally NOT here pending business/legal classification. They default
 * to requiring analytics consent (conservative position).
 */
const NECESSARY_EVENTS = new Set<AnalyticsEventType>([
  AnalyticsEvent.LOGIN,
  AnalyticsEvent.LOGOUT,
  AnalyticsEvent.SIGN_UP,
  AnalyticsEvent.PROFILE_UPDATE,
])

/**
 * Events that require personalization consent rather than general analytics.
 * These are gated behind consentState.personalization.
 */
const PERSONALIZATION_EVENTS = new Set<AnalyticsEventType>([
  AnalyticsEvent.SIZE_SELECTED,
  AnalyticsEvent.COLOR_SELECTED,
  AnalyticsEvent.RECOMMENDATION_CLICK,
])

// ── Session key helpers ─────────────────────────────────────────────────────

const SESSION_KEY_STORAGE = "xinvora_session_key"

function getSessionKey(): string {
  if (typeof window === "undefined") return ""
  let key = localStorage.getItem(SESSION_KEY_STORAGE)
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY_STORAGE, key)
  }
  return key
}

function rotateSessionKey(): string {
  if (typeof window === "undefined") return ""
  const newKey = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY_STORAGE, newKey)
  return newKey
}

// ── Context ─────────────────────────────────────────────────────────────────

interface AnalyticsContextType {
  trackEvent: (
    eventType: AnalyticsEventType,
    payload?: Record<string, any>,
    productId?: string | null,
    categoryId?: string | null,
    orderId?: string | null,
    collectionId?: string | null,
    variantId?: string | null
  ) => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { consentState, isLoaded } = useCookieConsent()

  // Track previous userId to detect account switches and logouts
  const prevUserIdRef = useRef<string | null>(null)
  const isInitialMountRef = useRef<boolean>(true)

  // ── Account-switch safety: rotate sessionKey when switching accounts or on logout ──
  useEffect(() => {
    const currentUserId = session?.user?.id ?? null

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      prevUserIdRef.current = currentUserId
      return
    }

    const prevUserId = prevUserIdRef.current

    // Case 1: Person A logged out (prevUserId !== null && currentUserId === null)
    // Rotate session key so post-logout guest browsing starts a fresh session.
    // Case 2: Person B logged in after Person A (prevUserId !== null && currentUserId !== null && prevUserId !== currentUserId)
    // Rotate session key so Person B gets a fresh session row.
    // Case 3: Person B logs in after Person A had logged out
    const lastAuthUser = typeof window !== "undefined" ? localStorage.getItem("xinvora_last_auth_user") : null
    const isDifferentUser = currentUserId !== null && lastAuthUser !== null && lastAuthUser !== currentUserId
    const isLogout = prevUserId !== null && currentUserId === null
    const isDirectAccountSwitch = prevUserId !== null && currentUserId !== null && prevUserId !== currentUserId

    if (isLogout || isDirectAccountSwitch || isDifferentUser) {
      rotateSessionKey()
    }

    if (currentUserId) {
      if (typeof window !== "undefined") {
        localStorage.setItem("xinvora_last_auth_user", currentUserId)
      }
    } else if (isLogout) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("xinvora_last_auth_user")
      }
    }

    prevUserIdRef.current = currentUserId
  }, [session?.user?.id])

  const trackEvent = async (
    eventType: AnalyticsEventType,
    payload: Record<string, any> = {},
    productId?: string | null,
    categoryId?: string | null,
    orderId?: string | null,
    collectionId?: string | null,
    variantId?: string | null
  ) => {
    try {
      // ── Consent gate ───────────────────────────────────────────────────────
      // Wait until CookieProvider has resolved the consent state.
      if (!isLoaded) return

      const isNecessary = NECESSARY_EVENTS.has(eventType)
      const isPersonalization = PERSONALIZATION_EVENTS.has(eventType)

      if (!isNecessary) {
        if (isPersonalization && !consentState.personalization) return
        if (!isPersonalization && !consentState.analytics) return
      }
      // ── End consent gate ───────────────────────────────────────────────────

      const sessionKey = getSessionKey()
      if (!sessionKey) return

      const eventId = crypto.randomUUID()
      const userId = session?.user?.id || null
      const anonymousId = getOrCreateAnonymousId()

      const body = {
        eventId,
        sessionKey,
        userId,
        eventType,
        productId: productId || null,
        categoryId: categoryId || null,
        orderId: orderId || null,
        collectionId: collectionId || null,
        variantId: variantId || null,
        page: window.location.pathname + window.location.search,
        referrer: (window as any).__xinvoraPrevPath || document.referrer || null,
        device: getDeviceType(),
        country: null,
        source: "WEB",
        payload: {
          ...payload,
          anonymousId,
          utmInfo: getUtmParameters(),
        },
        createdAt: new Date().toISOString(),
      }

      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      })
    } catch (err) {
      console.warn("[Analytics] Telemetry event failed to send:", err)
    }
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {/* PageViewTracker uses useSearchParams/usePathname — needs Suspense boundary.
          Children render immediately, unaffected. */}
      <Suspense fallback={null}>
        <PageViewTracker trackEvent={trackEvent} />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  )
}

// ── Page View Tracker ────────────────────────────────────────────────────────

function PageViewTracker({
  trackEvent,
}: {
  trackEvent: AnalyticsContextType["trackEvent"]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (prevPathRef.current === currentPath) return

    const timer = setTimeout(() => {
      trackEvent(AnalyticsEvent.PAGE_VIEW, {
        title: document.title,
      })
      if (typeof window !== "undefined") {
        ;(window as any).__xinvoraPrevPath = prevPathRef.current
      }
      prevPathRef.current = currentPath
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname, searchParams, trackEvent])

  return null
}

// ── Utilities ────────────────────────────────────────────────────────────────

const getDeviceType = () => {
  if (typeof window === "undefined") return "DESKTOP"
  const width = window.innerWidth
  if (width < 768) return "MOBILE"
  if (width < 1024) return "TABLET"
  return "DESKTOP"
}

const getUtmParameters = () => {
  if (typeof window === "undefined") return { source: null, medium: null, campaign: null }
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  }
}
