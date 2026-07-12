/**
 * app/layout.tsx — XINVORA Root Layout (Phase 1 Foundation)
 *
 * Minimal root layout for the Phase 1 enterprise foundation.
 * Responsibilities:
 * - Font loading via next/font (prevents FOUT, self-hosted)
 * - Provider tree injection (ThemeProvider)
 * - Global metadata defaults via buildRootMetadata()
 * - HTML lang + suppressHydrationWarning for next-themes
 *
 * Phase 2 will add: Navbar, Footer, ScrollProgress, BackToTop
 */

import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google"
import type { ReactNode } from "react"
import { Providers } from "@/providers/providers"
import { buildRootMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"
import { SkipToContent } from "@/components/shared/skip-to-content"
import NextTopLoader from "nextjs-toploader"
import "@/app/globals.css"

// ── Font Loading ──────────────────────────────────────────────────────────────
// next/font automatically subsets, self-hosts, and injects fonts.
// display: "swap" prevents invisible text during font load (FOIT).

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = buildRootMetadata()

// ── Viewport ──────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          cormorantGaramond.variable,
          manrope.variable,
          playfair.variable,
          "font-sans bg-background text-text-primary antialiased"
        )}
      >
        <Providers>
          <NextTopLoader
            color="#A48B78"
            height={2}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow={false}
          />
          <SkipToContent />
          <main id="main-content" className="flex min-h-[100dvh] flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
