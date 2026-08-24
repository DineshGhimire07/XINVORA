/**
 * XINVORA Service Worker (v4)
 * Handles fast asset caching for a premium, low-latency shopping experience.
 *
 * Strategy:
 * - HTML / Navigations: Browser & Next.js native (allows instant BFCache & router cache)
 * - Static assets (JS/CSS/fonts/images): Cache-first (ultra-fast loads)
 * - API calls: Network-only (never cache API data)
 */

const CACHE_VERSION = "xinvora-v4"
const STATIC_CACHE = `${CACHE_VERSION}-static`

// Only pre-cache the offline fallback
const PRECACHE_ASSETS = [
  "/offline",
]

// Install: pre-cache static offline shell
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
          .filter((key) => key.startsWith("xinvora-") && key !== STATIC_CACHE)
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

  // Skip Next.js internal routes and navigations to allow instant BFCache and router caching
  if (url.pathname.startsWith("/_next/data/") || request.mode === "navigate") return

  // Static assets (_next/static, fonts, images, icons) — Cache-first
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
})

