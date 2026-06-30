/**
 * config/env.ts — XINVORA Type-Safe Environment Variables
 *
 * Centralizes and validates all environment variable access.
 * Throw at startup if required variables are missing.
 *
 * Usage:
 *   import { env } from "@/config/env"
 *   env.APP_URL  // typed string, validated at startup
 *
 * Rules:
 * - Server-only variables must NOT be prefixed with NEXT_PUBLIC_
 * - Client-safe variables MUST be prefixed with NEXT_PUBLIC_
 * - Never use process.env directly in components — use env.*
 */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(
      `[XINVORA] Missing required environment variable: ${key}\n` +
        `Add it to .env.local (see .env.local.example)`
    )
  }
  return value
}

function getOptionalEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback
}


// ── Public (client-safe) variables ────────────────────────────────────────────
const publicEnv = {
  /** Base URL of the application */
  APP_URL: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  /** Application name */
  APP_NAME: getEnv("NEXT_PUBLIC_APP_NAME", "XINVORA"),
  /** Google Analytics Measurement ID (optional) */
  GA_ID: getOptionalEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  /** PostHog analytics key (optional) */
  POSTHOG_KEY: getOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY"),
} as const

// ── Server-only variables ─────────────────────────────────────────────────────
// These are NOT prefixed with NEXT_PUBLIC — they NEVER reach the browser.
const serverEnv =
  typeof window === "undefined"
    ? {
        /** Database connection string */
        DATABASE_URL: getOptionalEnv("DATABASE_URL"),
        /** Auth secret for signing sessions */
        NEXTAUTH_SECRET: getOptionalEnv("NEXTAUTH_SECRET"),
        /** Resend API key for transactional email */
        RESEND_API_KEY: getOptionalEnv("RESEND_API_KEY"),
        /** Stripe secret key */
        STRIPE_SECRET_KEY: getOptionalEnv("STRIPE_SECRET_KEY"),
      }
    : {}

// ── Computed flags ────────────────────────────────────────────────────────────
const flags = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_TEST: process.env.NODE_ENV === "test",
} as const

// ── Merged export ─────────────────────────────────────────────────────────────
export const env = {
  ...publicEnv,
  ...serverEnv,
  ...flags,
} as const

export type Env = typeof env
