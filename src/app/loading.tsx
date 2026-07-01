/**
 * app/loading.tsx — XINVORA Page Loading State
 *
 * Next.js App Router automatically renders this component while a Server
 * Component page is streaming its content to the client.
 *
 * This file is intentionally a Server Component (no "use client") because
 * it needs no browser APIs or state — it is pure static UI.
 *
 * The loading state appears:
 * - On first navigation to a route (if the page is slow to respond)
 * - On client-side navigations between routes using next/link
 *
 * Design principles:
 * - Calm, not anxious. A single, centered indicator — not a skeleton of the page.
 * - Uses the .shimmer animation defined in globals.css and Tailwind keyframes.
 * - Uses only design token classes — zero hardcoded values.
 * - Provides an aria-label for screen reader users.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="flex flex-1 flex-col items-center justify-center px-6 py-32"
    >
      {/* Brand wordmark pulse — minimal, on-brand loading indicator */}
      <div className="flex flex-col items-center gap-6">

        {/* Animated shimmer bar — uses Tailwind keyframe animation */}
        <div
          aria-hidden="true"
          className="h-px w-24 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
        />

        {/* Loading label — accessible, restrained */}
        <p className="text-overline text-text-tertiary tracking-overline">
          <span className="sr-only">Loading</span>
          <span aria-hidden="true">·&nbsp;&nbsp;·&nbsp;&nbsp;·</span>
        </p>

      </div>
    </div>
  )
}
