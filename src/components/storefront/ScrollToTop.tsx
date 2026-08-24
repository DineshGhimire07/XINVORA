"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPopstateTimeRef = useRef<number>(0)
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Enable browser-native scroll restoration for BFCache and popstate navigation
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto"
    }

    const handlePopState = () => {
      lastPopstateTimeRef.current = Date.now()
    }

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        lastPopstateTimeRef.current = Date.now()
      }
    }

    window.addEventListener("popstate", handlePopState, { passive: true })
    window.addEventListener("pageshow", handlePageShow, { passive: true })
    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("pageshow", handlePageShow)
    }
  }, [])

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // Skip on initial mount if already at top
    if (prevPathRef.current === null) {
      prevPathRef.current = currentPath
      return
    }

    const isDifferentPath = prevPathRef.current !== currentPath
    prevPathRef.current = currentPath

    // If popstate occurred within the last 1500ms, let browser restore scroll
    const isPopState = Date.now() - lastPopstateTimeRef.current < 1500

    if (isPopState) {
      return
    }

    if (isDifferentPath) {
      // Forward / Push navigation: guarantee page starts at top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      })

      // Secondary check after next paint frame to handle streaming/async page layout settlement
      const rafId = requestAnimationFrame(() => {
        if (Date.now() - lastPopstateTimeRef.current >= 1500) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          })
        }
      })

      return () => cancelAnimationFrame(rafId)
    }
  }, [pathname, searchParams])

  return null
}


