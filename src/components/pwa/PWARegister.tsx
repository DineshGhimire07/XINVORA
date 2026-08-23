"use client"

import { useEffect } from "react"

/**
 * PWARegister — silently registers the XINVORA service worker.
 * Mounted once in the root layout. No UI rendered.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // Silently ignore — SW registration failures are non-fatal
          if (process.env.NODE_ENV === "development") {
            console.warn("[XINVORA PWA] Service worker registration failed:", err)
          }
        })
    })
  }, [])

  return null
}
