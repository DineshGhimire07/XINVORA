/**
 * app/not-found.tsx — XINVORA 404 Page
 *
 * Rendered automatically by Next.js when a route is not found.
 * Uses the design system — no hardcoded colors or spacing.
 */

import Link from "next/link"
import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  noIndex: true,
})

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <div className="max-w-content-sm space-y-8">
        {/* 404 — editorial number */}
        <p
          className="font-display text-[8rem] leading-none text-border font-light select-none"
          aria-hidden="true"
        >
          404
        </p>

        <div className="space-y-4">
          <h1 className="text-heading-lg text-text-primary">
            Page not found
          </h1>
          <p className="text-body-md text-text-secondary max-w-prose mx-auto text-pretty">
            The page you are looking for may have moved, been removed, or never
            existed. Let us help you find your way back.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
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
            Return home
          </Link>
          <Link
            href="/shop"
            className="
              inline-flex items-center justify-center
              h-12 px-8
              border border-border text-text-primary
              text-label-md font-medium tracking-wide
              rounded-sm
              transition-all duration-200
              hover:border-accent hover:text-accent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
            "
          >
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  )
}
