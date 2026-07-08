"use client"

/**
 * providers/providers.tsx — XINVORA Root Provider Tree
 *
 * This component composes all React context providers into a single tree.
 * Import and use ONLY in the root layout.tsx — never inside pages or features.
 *
 * Provider order matters:
 * ThemeProvider → (future: AuthProvider → CartProvider → ...)
 *
 * To add a new provider, import it here and wrap children.
 * This keeps layout.tsx clean and provider logic isolated.
 */

import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"
import { SessionProvider } from "next-auth/react"
import { AnalyticsProvider } from "@/features/analytics/ingestion/tracking-provider"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
