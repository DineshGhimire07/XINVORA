"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isPopStateRef = useRef(false)

  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    // If the navigation is a browser back/forward (popstate), do not reset scroll to top
    if (isPopStateRef.current) {
      isPopStateRef.current = false
      return
    }

    // Reset scroll position to top only on forward/push navigation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    })
  }, [pathname, searchParams])

  return null
}

