/**
 * animations/gsap-presets.ts — XINVORA GSAP Animation Helpers
 *
 * GSAP is used for:
 * - Magnetic button effects (cursor following)
 * - ScrollTrigger-based reveals (not possible with Framer Motion)
 * - High-performance DOM animations (canvas, SVG, complex sequences)
 * - Timeline orchestration for complex multi-element sequences
 *
 * Rules:
 * - Always register plugins before using them.
 * - Use `gsap.context()` inside React components to scope and clean up.
 * - Prefer Framer Motion for simple component animations.
 * - Use GSAP only when you need ScrollTrigger or DOM-level control.
 *
 * Usage (inside a React component with useEffect):
 *   import { gsapFadeUp, magneticHover } from "@/animations/gsap-presets"
 *
 *   useEffect(() => {
 *     const ctx = gsap.context(() => {
 *       gsapFadeUp(".my-element")
 *     }, ref)
 *     return () => ctx.revert()
 *   }, [])
 */

"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// ── Plugin Registration ───────────────────────────────────────────────────────
// Only register on the client side (GSAP plugins don't work on server)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ── GSAP Defaults ─────────────────────────────────────────────────────────────
// Set project-wide GSAP defaults — keeps animations consistent
gsap.defaults({
  ease: "power2.out",
  duration: 0.5,
})

// ── Fade Up (ScrollTrigger) ───────────────────────────────────────────────────
/**
 * Fade elements up from below when they enter the viewport.
 *
 * @param target — CSS selector or element(s)
 * @param options — Override defaults
 */
export function gsapFadeUp(
  target: gsap.TweenTarget,
  options: {
    y?: number
    duration?: number
    stagger?: number
    delay?: number
    scrollTrigger?: boolean
    start?: string
  } = {}
) {
  const {
    y = 30,
    duration = 0.7,
    stagger = 0.1,
    delay = 0,
    scrollTrigger: useScrollTrigger = true,
    start = "top 85%",
  } = options

  return gsap.from(target, {
    y,
    opacity: 0,
    duration,
    stagger,
    delay,
    ease: "power2.out",
    ...(useScrollTrigger && {
      scrollTrigger: {
        trigger: target as Element,
        start,
        once: true,
      },
    }),
  })
}

// ── Fade In (ScrollTrigger) ───────────────────────────────────────────────────
export function gsapFadeIn(
  target: gsap.TweenTarget,
  options: { duration?: number; delay?: number; start?: string } = {}
) {
  const { duration = 0.6, delay = 0, start = "top 90%" } = options

  return gsap.from(target, {
    opacity: 0,
    duration,
    delay,
    ease: "power2.out",
    scrollTrigger: {
      trigger: target as Element,
      start,
      once: true,
    },
  })
}

// ── Text Reveal (stagger each character or word) ──────────────────────────────
export function gsapTextReveal(
  target: gsap.TweenTarget,
  options: { stagger?: number; duration?: number; y?: number } = {}
) {
  const { stagger = 0.03, duration = 0.6, y = 20 } = options

  return gsap.from(target, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: "power3.out",
    scrollTrigger: {
      trigger: target as Element,
      start: "top 85%",
      once: true,
    },
  })
}

// ── Stagger Reveal ────────────────────────────────────────────────────────────
export function gsapStagger(
  target: gsap.TweenTarget,
  options: {
    y?: number
    stagger?: number
    duration?: number
    start?: string
  } = {}
) {
  const { y = 20, stagger = 0.08, duration = 0.6, start = "top 80%" } = options

  return gsap.from(target, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: "power2.out",
    scrollTrigger: {
      trigger: target as Element,
      start,
      once: true,
    },
  })
}

// ── Horizontal Scroll Line (decorative) ──────────────────────────────────────
export function gsapLineReveal(target: gsap.TweenTarget) {
  return gsap.from(target, {
    scaleX: 0,
    transformOrigin: "left center",
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: target as Element,
      start: "top 85%",
      once: true,
    },
  })
}

// ── Magnetic Button Effect ────────────────────────────────────────────────────
/**
 * Creates a magnetic hover effect on a button element.
 * The element follows the cursor within its bounding box.
 *
 * Attach event listeners via the returned cleanup function.
 *
 * Usage:
 *   const cleanup = magneticEffect(buttonRef.current, 0.5)
 *   return () => cleanup()
 */
export function magneticEffect(
  element: HTMLElement,
  strength: number = 0.4
): () => void {
  function onMouseMove(e: MouseEvent) {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.4,
      ease: "power2.out",
    })
  }

  function onMouseLeave() {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    })
  }

  element.addEventListener("mousemove", onMouseMove)
  element.addEventListener("mouseleave", onMouseLeave)

  return () => {
    element.removeEventListener("mousemove", onMouseMove)
    element.removeEventListener("mouseleave", onMouseLeave)
  }
}

// ── Parallax ──────────────────────────────────────────────────────────────────
/**
 * Apply a vertical parallax effect to an element.
 *
 * @param target — The element to animate
 * @param speed — How much it moves relative to scroll (0 = none, 1 = full)
 */
export function gsapParallax(target: gsap.TweenTarget, speed: number = 0.3) {
  return gsap.to(target, {
    yPercent: -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: target as Element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  })
}

// ── ScrollTrigger Cleanup ─────────────────────────────────────────────────────
/**
 * Kill all ScrollTrigger instances. Call on unmount or route change.
 */
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
}

// ── Re-export GSAP core for convenience ──────────────────────────────────────
export { gsap, ScrollTrigger }
