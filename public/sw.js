/**
 * XINVORA Service Worker
 * Self-unregisters to unlock 0ms native WebKit PageCache (BFCache) on iOS & Android.
 */

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      return self.registration.unregister()
    })
  )
})


