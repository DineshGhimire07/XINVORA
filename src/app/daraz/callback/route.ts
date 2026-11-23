import { NextRequest, NextResponse } from "next/server"
import { DarazClient } from "@/lib/daraz/client"
import { DarazService } from "@/services/daraz.service"
import { cookies } from "next/headers"

/**
 * Daraz Open Platform OAuth Callback Route
 *
 * Registered URL: https://xinvora.com.np/daraz/callback
 * Must handle incoming GET request with ?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error") || searchParams.get("error_description")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xinvora.com.np"
  const redirectTarget = new URL("/admin/daraz", appUrl)

  // 1. Handle Daraz error parameter
  if (errorParam) {
    console.error("[Daraz OAuth Callback] Returned error from Daraz:", errorParam)
    redirectTarget.searchParams.set("error", encodeURIComponent(errorParam))
    return NextResponse.redirect(redirectTarget)
  }

  // 2. Validate authorization code
  if (!code) {
    redirectTarget.searchParams.set("error", "missing_code")
    return NextResponse.redirect(redirectTarget)
  }

  // 3. Validate state to prevent CSRF attacks when state cookie is available
  const cookieStore = await cookies()
  const savedState = cookieStore.get("daraz_oauth_state")?.value

  if (savedState && state && state !== savedState) {
    console.warn("[Daraz OAuth Callback] State mismatch / potential CSRF attempt.", {
      receivedState: state,
      savedState,
    })
    redirectTarget.searchParams.set("error", "state_mismatch")
    return NextResponse.redirect(redirectTarget)
  }

  try {
    // 4. Exchange code for Access & Refresh tokens via /auth/token/create
    const client = new DarazClient()
    const tokenResponse = await client.createToken(code)

    if (!tokenResponse.access_token) {
      throw new Error(tokenResponse.message || "Failed to acquire access token from Daraz.")
    }

    // 5. Encrypt and store tokens in the database
    await DarazService.saveOAuthTokens(tokenResponse)

    // 6. Clear the one-time state cookie
    cookieStore.delete("daraz_oauth_state")

    redirectTarget.searchParams.set("status", "connected")
    redirectTarget.searchParams.set("account", tokenResponse.account || "daraz_seller")

    return NextResponse.redirect(redirectTarget)
  } catch (err: any) {
    console.error("[Daraz OAuth Callback] Token exchange exception:", err)
    redirectTarget.searchParams.set("error", encodeURIComponent(err.message || "token_exchange_failed"))
    return NextResponse.redirect(redirectTarget)
  }
}
