import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import { PREVIEW_CONFIG } from "./config/preview"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isPreviewPage = nextUrl.pathname === "/preview"
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isAccountRoute = nextUrl.pathname.startsWith("/account")

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", nextUrl.pathname)

  // ── Pre-Launch Preview Gate ──────────────────────────────────────────────
  // When enabled, all routes (except /preview and /api) require the preview
  // cookie to be present. Set NEXT_PUBLIC_PREVIEW_MODE=false to disable.
  if (PREVIEW_CONFIG.enabled && !isPreviewPage && !isApiRoute) {
    const previewCookie = req.cookies.get(PREVIEW_CONFIG.cookieName)
    const hasAccess = previewCookie?.value === PREVIEW_CONFIG.accessKey

    if (!hasAccess) {
      const previewUrl = new URL("/preview", nextUrl)
      return NextResponse.redirect(previewUrl)
    }
  }

  // Always allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Redirect authenticated users away from auth routes (login/register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/account", nextUrl))
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Protect Admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Protect Account routes
  if (isAccountRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|images|favicons|icons|favicon.ico).*)", "/api/auth(.*)"],
}

