"use client"

import { useEffect } from "react"

/**
 * PWARegister — unregisters any active service worker to unlock native
 * WebKit PageCache (BFCache) on iOS Safari & Chrome iOS.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // Unregister any active service worker to allow 0ms BFCache restorations
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
    }).catch(() => {})

    // Clean up old caches
    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith("xinvora-")) {
            caches.delete(key)
          }
        }
      }).catch(() => {})
    }
  }, [])

  return null
}

