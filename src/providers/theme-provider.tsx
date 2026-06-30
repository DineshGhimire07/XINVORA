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

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
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
