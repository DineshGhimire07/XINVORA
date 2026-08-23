/**
 * XINVORA Service Worker
 * Handles offline caching for a premium shopping experience.
 *
 * Strategy:
 * - HTML pages: Network-first (always fresh content), fallback to cache
 * - Static assets (JS/CSS/fonts/images): Cache-first (fast loads)
 * - API calls: Network-only (never cache API data)
 */

const CACHE_VERSION = "xinvora-v1"
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PAGE_CACHE = `${CACHE_VERSION}-pages`

// Assets to pre-cache on install (app shell)
const PRECACHE_ASSETS = [
  "/",
  "/offline",
]

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("xinvora-") && key !== STATIC_CACHE && key !== PAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: apply caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return

  // Skip API routes — always network-only
  if (url.pathname.startsWith("/api/")) return

  // Skip Next.js internal routes
  if (url.pathname.startsWith("/_next/data/")) return

  // Static assets (_next/static, fonts, images) — Cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/favicons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico|woff2|woff|ttf)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // HTML pages — Network-first, fallback to cache, then offline page
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          const cached = await cache.match(request)
          if (cached) return cached
          const offlinePage = await caches.match("/offline")
          return offlinePage || new Response("You are offline.", { status: 503 })
        }
      })
    )
    return
  }
})
