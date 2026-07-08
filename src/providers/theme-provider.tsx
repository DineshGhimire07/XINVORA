"use client"

/**
 * providers/theme-provider.tsx — XINVORA Theme Provider
 *
 * Wraps next-themes ThemeProvider with XINVORA-specific configuration.
 * Light theme is default. Dark theme uses CSS variable overrides in globals.css.
 *
 * The `attribute="class"` setting applies class="dark" to <html>,
 * which triggers our .dark CSS variable overrides.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

import * as React from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const orig = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return
      orig.apply(console, args)
    }
  }
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
