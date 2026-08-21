import { NextRequest } from "next/server"

/**
 * Resolves the canonical base URL for the site in production or local development.
 * Single source of truth for site URL resolution across SEO metadata, sitemaps, robots, and JSON-LD.
 */
export function getSiteUrl(req?: NextRequest): string {
  // 1. Explicit env vars in priority order
  const rawEnvUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  // 2. Production environment guard: Never output localhost in production builds/deployments
  if (process.env.NODE_ENV === "production") {
    if (rawEnvUrl && !rawEnvUrl.includes("localhost") && !rawEnvUrl.includes("127.0.0.1")) {
      let clean = rawEnvUrl.trim()
      if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
        clean = `https://${clean}`
      }
      return clean.replace(/\/$/, "")
    }
    return "https://www.xinvora.com.np"
  }

  // 3. Local development or non-production env with explicit env var
  if (rawEnvUrl) {
    let clean = rawEnvUrl.trim()
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`
    }
    return clean.replace(/\/$/, "")
  }

  // 4. Request header fallback for dynamic server requests
  if (req) {
    const host = req.headers.get("host")
    if (host) {
      const forwardedProto = req.headers.get("x-forwarded-proto")
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1")
      const protocol = forwardedProto || (isLocalhost ? "http" : "https")
      return `${protocol}://${host}`.replace(/\/$/, "")
    }
  }

  // 5. Default local dev fallback
  return "http://localhost:3000"
}
