"use client"

/**
 * app/error.tsx — XINVORA Error Boundary
 *
 * Next.js App Router automatically renders this component when an
 * unhandled error is thrown inside a page or its nested Server Components.
 *
 * Rules:
 * - MUST be a Client Component ("use client") — React error boundaries
 *   require client-side lifecycle methods.
 * - Receives `error` (the thrown Error object) and `reset` (a function
 *   that re-renders the page segment to attempt recovery).
 * - Uses only design token classes — zero hardcoded colors or spacing.
 * - No navigation chrome — this is page-level only.
 *
 * Scope:
 * - Catches errors inside src/app/page.tsx and nested layouts.
 * - Does NOT catch errors inside src/app/layout.tsx (use global-error.tsx
 *   for root layout errors — a future phase concern).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log errors in development for debugging.
    // In production, plug in your error tracking service here (e.g. Sentry).
    if (process.env.NODE_ENV === "development") {
      console.error("[XINVORA Error Boundary]", error)
    }
  }, [error])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center"
    >
      <div className="max-w-content-sm space-y-8">

        {/* Error indicator — editorial, restrained */}
        <p
          className="font-display text-[6rem] leading-none text-border font-light select-none"
          aria-hidden="true"
        >
          !
        </p>

        <div className="space-y-4">
          {/* Single h1 per page — required for accessibility */}
          <h1 className="text-heading-lg text-text-primary">
            Something went wrong
          </h1>

          <p className="text-body-md text-text-secondary max-w-prose mx-auto text-pretty">
            An unexpected error occurred. This has been noted. You can try
            again — if the problem persists, please refresh the page.
          </p>

          {/* Error digest — visible in development only for debugging */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="text-caption text-text-tertiary font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Recovery action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={reset}
            className="
              inline-flex items-center justify-center
              h-12 px-8
              bg-ink text-text-inverse
              text-label-md font-medium tracking-wide
              rounded-sm
              transition-all duration-200
              hover:bg-accent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
            "
          >
            Try again
          </button>
        </div>

      </div>
    </div>
  )
}
