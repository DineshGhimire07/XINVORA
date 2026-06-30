"use client"

/**
 * hooks/use-scroll-position.ts — XINVORA Scroll Position Hook
 *
 * Tracks scroll position and direction.
 * Used by the Navbar to:
 * - Switch from transparent to solid background after scroll
 * - Hide on scroll down, reveal on scroll up (sophisticated UX)
 *
 * Optimized with requestAnimationFrame to avoid layout thrashing.
 *
 * Usage:
 *   const { scrollY, scrollDirection, isScrolled, isAtTop } = useScrollPosition()
 */

import { useState, useEffect, useRef } from "react"

export type ScrollDirection = "up" | "down" | "idle"

export interface ScrollPosition {
  /** Current scroll Y position in pixels */
  scrollY: number
  /** Previous scroll Y position */
  prevScrollY: number
  /** Direction of last scroll movement */
  scrollDirection: ScrollDirection
  /** True when scrolled past the threshold */
  isScrolled: boolean
  /** True when at the very top of the page */
  isAtTop: boolean
  /** Scroll progress as a value between 0 and 1 */
  progress: number
}

interface UseScrollPositionOptions {
  /** Pixel threshold before isScrolled becomes true */
  threshold?: number
  /** Debounce in ms — avoids excessive re-renders */
  debounce?: number
}

export function useScrollPosition({
  threshold = 80,
  debounce = 50,
}: UseScrollPositionOptions = {}): ScrollPosition {
  const [state, setState] = useState<ScrollPosition>({
    scrollY: 0,
    prevScrollY: 0,
    scrollDirection: "idle",
    isScrolled: false,
    isAtTop: true,
    progress: 0,
  })

  const rafRef = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    function handleScroll() {
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight
        const progress = maxScroll > 0 ? currentScrollY / maxScroll : 0

        setState({
          scrollY: currentScrollY,
          prevScrollY: lastScrollY.current,
          scrollDirection:
            currentScrollY > lastScrollY.current
              ? "down"
              : currentScrollY < lastScrollY.current
                ? "up"
                : "idle",
          isScrolled: currentScrollY > threshold,
          isAtTop: currentScrollY <= 0,
          progress: Math.min(1, Math.max(0, progress)),
        })

        lastScrollY.current = currentScrollY
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Initialize with current position
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [threshold, debounce])

  return state
}
