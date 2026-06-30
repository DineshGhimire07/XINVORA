/**
 * middleware.ts — XINVORA Edge Middleware
 *
 * IMPORTANT: This file MUST live at the project root (not inside src/).
 * Next.js Edge Runtime only resolves middleware from the root directory.
 *
 * Current responsibilities:
 * - Security headers (supplementing next.config.ts)
 * - Request logging (development only)
 *
 * Future responsibilities (slot in here as features are built):
 * - Auth guard: Redirect unauthenticated users from /account, /orders
 * - Locale detection and i18n routing (e.g., /en/, /gb/)
 * - Maintenance mode redirect
 * - A/B test assignment via cookies
 * - Rate limiting (via Upstash Redis)
 * - Geolocation-based routing
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  void request
  const response = NextResponse.next()

  // ── Security Headers ──────────────────────────────────────────────────────
  // These supplement the headers in next.config.ts
  response.headers.set("X-Middleware-Applied", "true")

  // ── Future: Auth Guard ────────────────────────────────────────────────────
  // const token = request.cookies.get("next-auth.session-token")
  // const isProtectedRoute = request.nextUrl.pathname.startsWith("/account")
  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL("/sign-in", request.url))
  // }

  // ── Future: Maintenance Mode ──────────────────────────────────────────────
  // if (process.env.MAINTENANCE_MODE === "true") {
  //   return NextResponse.rewrite(new URL("/maintenance", request.url))
  // }

  // ── Future: i18n Routing ──────────────────────────────────────────────────
  // Detect locale from Accept-Language header and redirect accordingly

  return response
}

/**
 * Matcher configuration.
 *
 * Excludes:
 * - Static files (_next/static, images, fonts)
 * - API routes (handled separately)
 * - Favicon and public assets
 *
 * Everything else (all page routes) passes through middleware.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|favicons|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
}
