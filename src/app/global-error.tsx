"use client" // Error boundaries must be Client Components

/**
 * app/global-error.tsx — XINVORA Global Error Boundary
 *
 * This boundary catches errors thrown in the root layout (app/layout.tsx).
 * Standard error.tsx does NOT catch layout errors.
 *
 * Requirements:
 * - Must output its own <html> and <body> tags
 * - Should be extremely robust (no complex dependencies that might also crash)
 */

import { Button } from "@/components/ui/button"
import { Manrope } from "next/font/google"
import { useEffect } from "react"
import "./globals.css" // Required because layout.css might have failed

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error)
  }, [error])

  return (
    <html lang="en" className={manrope.className}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-text-primary p-6 text-center antialiased">
        <div className="max-w-md space-y-6">
          <h1 className="text-display-sm font-semibold tracking-tight text-text-primary">
            Critical System Error
          </h1>
          <p className="text-body-md text-text-secondary">
            XINVORA is currently experiencing a critical infrastructure issue. Our engineering team has been notified.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="text-left rounded-md bg-surface-elevated p-4 overflow-auto max-h-48 border border-border">
              <p className="text-code text-sm text-text-error font-medium">{error.message}</p>
            </div>
          )}
          <div className="pt-4">
            <Button onClick={() => reset()} variant="primary" size="lg" className="w-full sm:w-auto">
              Attempt Recovery
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
