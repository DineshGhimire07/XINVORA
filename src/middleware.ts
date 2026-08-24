import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import { PREVIEW_CONFIG } from "./config/preview"
import { SEORedirectEngine } from "./domains/seo/engines/redirect.engine"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req

  // Fast SEO Redirect Check
  const redirectMatch = SEORedirectEngine.matchRedirect(nextUrl.pathname)
  if (redirectMatch) {
    const target = new URL(redirectMatch.targetUrl, nextUrl)
    return NextResponse.redirect(target, { status: redirectMatch.statusCode || 301 })
  }

  const user = req.auth?.user
  const isLoggedIn = !!user && !!user.id

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isPreviewPage = nextUrl.pathname === "/preview"
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isAccountRoute = nextUrl.pathname.startsWith("/account")

  // Always allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect authenticated users away from auth routes (login/register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/account"
      return NextResponse.redirect(new URL(callbackUrl, nextUrl))
    }
    return NextResponse.next()
  }

  // Protect Admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // Protect Account routes
  if (isAccountRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|images|favicons|icons|favicon.ico).*)", "/api/auth(.*)"],
}

