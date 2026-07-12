import "server-only"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { cache } from "react"
import { type TimingEntry, printTimingSummary } from "@/lib/perf"

// Request-scoped memoization of the Auth.js auth() database/session call
const getCachedSession = cache(async () => {
  const start = performance.now()
  const session = await auth()
  const duration = performance.now() - start
  console.log(`[SessionService] Database auth() lookup completed in ${duration.toFixed(2)}ms`)
  return session
})

/**
 * Session Service
 * 
 * Provides centralized authentication helpers to be used strictly by
 * Server Components and Server Actions.
 * 
 * RULE: No page, component, or client hook may directly access
 * authentication state except through these shared helpers or the
 * approved Auth.js APIs.
 */
export class SessionService {
  /**
   * Get the current session if available.
   * Does not throw or redirect if unauthenticated.
   */
  public static async optionalAuth() {
    const session = await getCachedSession()
    return session?.user || null
  }

  /**
   * Require an authenticated user session.
   * Redirects to the login page if not authenticated.
   */
  public static async requireAuth() {
    const user = await this.optionalAuth()
    if (!user) {
      redirect("/login")
    }
    return user
  }

  /**
   * Require an authenticated ADMIN session.
   * Redirects to login (or home) if not authorized.
   */
  public static async requireAdmin() {
    const user = await this.requireAuth()
    if (user.role !== "ADMIN") {
      redirect("/") // Or a dedicated unauthorized page
    }
    return user
  }

  /**
   * Resolve commerce identity (userId and guest sessionId)
   * used for carts and wishlists.
   */
  public static async getCommerceIdentity() {
    const user = await this.optionalAuth()
    const userId = user?.id ?? null
    
    let sessionId = null
    if (!userId) {
      const cookieStore = await cookies()
      sessionId = cookieStore.get("cart_session")?.value ?? null
    }

    return { userId, sessionId }
  }

  /**
   * Set a cryptographically secure CSRF nonce cookie for payment actions.
   */
  public static async setCsrfNonce(): Promise<string> {
    const cookieStore = await cookies()
    const nonce = crypto.randomUUID()
    cookieStore.set("payment_csrf_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600 // 1 hour validity
    })
    return nonce
  }

  /**
   * Verify CSRF nonce matches cookie.
   */
  public static async verifyCsrfNonce(nonceToVerify: string): Promise<boolean> {
    const cookieStore = await cookies()
    const nonce = cookieStore.get("payment_csrf_nonce")?.value
    if (!nonce || nonce !== nonceToVerify) {
      return false
    }
    // Burn nonce immediately after single-use verification
    cookieStore.delete("payment_csrf_nonce")
    return true
  }
}
