import { NextRequest, NextResponse } from "next/server"
import { CookieConsentService } from "@/services/cookie-consent.service"
import { parseAndVerifySignedCookie, CONSENT_COOKIE_NAME, buildSignedCookieValue } from "@/lib/cookies/cookie"
import { saveConsentSchema } from "@/validations/cookies"
import { SessionService } from "@/services/session.service"

export async function GET(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get(CONSENT_COOKIE_NAME)?.value
    const parsedCookie = parseAndVerifySignedCookie(cookieValue)

    const settings = await CookieConsentService.getPrivacySettings()

    // If version changed, indicate reconsent required
    const requiresReconsent = parsedCookie ? parsedCookie.policyVersion !== settings.currentPolicyVersion : true

    return NextResponse.json({
      success: true,
      data: {
        consent: parsedCookie,
        requiresReconsent,
        settings,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = saveConsentSchema.parse(body)
    const { userId } = await SessionService.getCommerceIdentity()

    const ipRaw = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || ""

    const consentRecord = await CookieConsentService.saveConsent(userId, parsed, { ipRaw, userAgent })

    const signedValue = buildSignedCookieValue(
      {
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        personalization: parsed.personalization,
      },
      parsed.policyVersion,
      parsed.source,
      parsed.method
    )

    const response = NextResponse.json({ success: true, data: consentRecord })
    response.cookies.set(CONSENT_COOKIE_NAME, signedValue, {
      path: "/",
      maxAge: 180 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await SessionService.getCommerceIdentity()
    const ipRaw = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || ""

    const response = NextResponse.json({ success: true, message: "Consent withdrawn successfully" })
    response.cookies.delete(CONSENT_COOKIE_NAME)

    return response
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
