import * as React from "react"

/**
 * components/shared/skip-to-content.tsx — XINVORA Skip Link
 *
 * Accessibility utility that allows keyboard users to bypass layout navigation.
 * Renders as the very first focusable element inside the body.
 *
 * Visually hidden by default (sr-only), but becomes visible on focus.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-tooltip
        focus:px-6 focus:py-3
        focus:bg-ink focus:text-text-inverse
        focus:border focus:border-accent focus:rounded-sm
        focus:font-sans focus:text-label-md focus:font-semibold focus:tracking-wider focus:uppercase
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        transition-all duration-150
      "
    >
      Skip to main content
    </a>
  )
}

SkipToContent.displayName = "SkipToContent"
