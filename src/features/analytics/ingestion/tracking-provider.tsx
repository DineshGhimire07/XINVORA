"use client"

import React, { createContext, useContext, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AnalyticsEvent, AnalyticsEventType } from "../events/registry"

interface AnalyticsContextType {
  trackEvent: (
    eventType: AnalyticsEventType,
    payload?: Record<string, any>,
    productId?: string | null,
    categoryId?: string | null,
    orderId?: string | null
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

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Track previous path to send as referrer
  const prevPathRef = useRef<string | null>(null)

  // Generate or load persistent session key
  const getSessionKey = (): string => {
    if (typeof window === "undefined") return ""
    let key = localStorage.getItem("xinvora_session_key")
    if (!key) {
      key = crypto.randomUUID()
      localStorage.setItem("xinvora_session_key", key)
    }
    return key
  }

  const trackEvent = async (
    eventType: AnalyticsEventType,
    payload: Record<string, any> = {},
    productId?: string | null,
    categoryId?: string | null,
    orderId?: string | null
  ) => {
    try {
      const sessionKey = getSessionKey()
      if (!sessionKey) return

      const eventId = crypto.randomUUID()
      const userId = session?.user?.id || null

      const body = {
        eventId,
        sessionKey,
        userId,
        eventType,
        productId: productId || null,
        categoryId: categoryId || null,
        orderId: orderId || null,
        page: window.location.pathname + window.location.search,
        referrer: prevPathRef.current || document.referrer || null,
        device: getDeviceType(),
        country: null,
        source: "WEB",
        payload: {
          ...payload,
          utmInfo: getUtmParameters(),
        },
        createdAt: new Date().toISOString(),
      }

      await fetch("/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    } catch (err) {
      console.warn("Telemetry event failed to send:", err)
    }
  }

  const getDeviceType = () => {
    const width = window.innerWidth
    if (width < 768) return "MOBILE"
    if (width < 1024) return "TABLET"
    return "DESKTOP"
  }

  const getUtmParameters = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
    }
  }

  // Auto-track PAGE_VIEW on route change
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    
    const timer = setTimeout(() => {
      trackEvent(AnalyticsEvent.PAGE_VIEW, {
        title: document.title,
      })
      prevPathRef.current = currentPath
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
