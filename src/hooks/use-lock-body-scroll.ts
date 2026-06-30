"use client"

/**
 * hooks/use-lock-body-scroll.ts — XINVORA Body Scroll Lock
 *
 * Locks body scroll when a drawer or modal is open.
 * Prevents the background page from scrolling underneath overlays.
 * Handles iOS Safari's overscroll behavior.
 *
 * Usage:
 *   const lockScroll = useLockBodyScroll()
 *   // In drawer open handler:
 *   lockScroll(true)
 *   // In drawer close handler:
 *   lockScroll(false)
 *
 * Or pass the active state directly:
 *   useLockBodyScroll(isDrawerOpen)
 */

import { useEffect } from "react"

export function useLockBodyScroll(locked?: boolean): void {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (locked === undefined) return

    if (locked) {
      const scrollY = window.scrollY
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [locked])
}
