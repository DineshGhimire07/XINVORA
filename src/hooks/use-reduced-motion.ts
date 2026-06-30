"use client"

/**
 * hooks/use-reduced-motion.ts — XINVORA Reduced Motion Hook
 *
 * Returns true when the user has enabled "reduce motion" in their OS settings.
 * Used in animation components to conditionally disable or simplify animations.
 *
 * WCAG 2.1 SC 2.3.3 — Animation from Interactions must be disableable.
 *
 * Usage:
 *   const prefersReducedMotion = useReducedMotion()
 *   const variants = prefersReducedMotion ? staticVariant : animatedVariant
 */

import { useSyncExternalStore } from "react"

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      mediaQuery.addEventListener("change", callback)
      return () => mediaQuery.removeEventListener("change", callback)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}
