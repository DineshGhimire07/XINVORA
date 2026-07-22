import { NextRequest } from "next/server"

/**
 * Resolves the canonical base URL for the site in production or local development.
 * Prioritizes environment variables to prevent Host header spoofing attacks.
 */
export function getSiteUrl(req?: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL
  if (envUrl) {
    let clean = envUrl.trim()
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`
    }
    return clean.replace(/\/$/, "")
  }

  if (req) {
    const host = req.headers.get("host") || "localhost:3000"
    const forwardedProto = req.headers.get("x-forwarded-proto")
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1")
    const protocol = forwardedProto || (isLocalhost ? "http" : "https")
    return `${protocol}://${host}`.replace(/\/$/, "")
  }

  return "http://localhost:3000"
}
