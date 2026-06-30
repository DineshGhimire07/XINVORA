"use client"

/**
 * hooks/use-media-query.ts — XINVORA Media Query Hook
 *
 * Returns true/false for a CSS media query string.
 * SSR-safe — returns false on server, hydrates correctly on client.
 *
 * Usage:
 *   const isMobile = useMediaQuery("(max-width: 768px)")
 *   const isDesktop = useMediaQuery("(min-width: 1024px)")
 *
 * Prefer using Tailwind CSS breakpoints for layout.
 * Use this hook only when you need JS-level breakpoint detection.
 */

import { useSyncExternalStore } from "react"
import { breakpoints } from "@/styles/tokens"

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener("change", callback)
      return () => mediaQuery.removeEventListener("change", callback)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

// ── Convenience Hooks ─────────────────────────────────────────────────────────
// Pre-built for the XINVORA breakpoint system (matches tailwind.config.ts)

export function useIsXs() {
  return useMediaQuery(`(min-width: ${breakpoints.xs}px)`)
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`)
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  )
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg}px)`)
}

export function useIsLarge() {
  return useMediaQuery(`(min-width: ${breakpoints.xl}px)`)
}

export function useIsExtraLarge() {
  return useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`)
}
