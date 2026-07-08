import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isAccountRoute = nextUrl.pathname.startsWith("/account")

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", nextUrl.pathname)

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
