/**
 * POST /api/analytics/event
 *
 * Analytics ingestion endpoint. Validates and enriches the incoming event,
 * responds with 202 Accepted immediately, then processes the event
 * after the response is flushed using next/server's after().
 *
 * Architecture:
 *   client sends event
 *       ↓
 *   validate + enrich (fast, synchronous)
 *       ↓
 *   202 Accepted  ← response to client
 *       ↓  (after() — runs post-response, within the same serverless invocation)
 *   processAnalyticsEvent(event)
 *       ↓
 *   db.transaction(session + userEvent + metrics + signals)
 *       ↓
 *   on failure → DLQ
 *
 * ANALYTICS FAILURES MUST NEVER REACH THE CLIENT:
 *   All DB work happens inside after(), which is fully isolated from the
 *   response. If processAnalyticsEvent() throws, it is caught internally
 *   and written to analyticsDlq — the 202 is already delivered.
 */

import { after } from "next/server"
import { NextRequest, NextResponse } from "next/server"
import { userAgent } from "next/server"
import { IngestEventSchema, DeviceType, DeviceTypeType } from "@/features/analytics/events/registry"
import { processAnalyticsEvent } from "@/features/analytics/ingestion/service"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()

    // ── Extract client metadata from Vercel/proxy headers ─────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1"
    const ua = userAgent(req)

    // Map Next.js user-agent device types to our DeviceTypeEnum
    let resolvedDevice: DeviceTypeType = DeviceType.DESKTOP
    if (ua.device.type === "mobile") {
      resolvedDevice = DeviceType.MOBILE
    } else if (ua.device.type === "tablet") {
      resolvedDevice = DeviceType.TABLET
    }

    // ── Geo enrichment from Vercel edge headers ────────────────────────────
    const geoInfo = {
      countryCode: req.headers.get("x-vercel-ip-country") || null,
      region: req.headers.get("x-vercel-ip-country-region") || null,
      city: req.headers.get("x-vercel-ip-city") || null,
      timezone: req.headers.get("x-vercel-ip-timezone") || null,
    }

    // ── Merge payload metadata ─────────────────────────────────────────────
    const clientPayload = rawBody.payload || {}
    const enrichedPayload = {
      ...clientPayload,
      ipAddress: ip,
      deviceInfo: {
        browser: ua.browser.name || "Unknown",
        os: ua.os.name || "Unknown",
      },
      geoInfo: {
        ...geoInfo,
        ...clientPayload.geoInfo,
      },
    }

    // ── Validate with Zod (fast — no DB) ──────────────────────────────────
    const validated = IngestEventSchema.parse({
      ...rawBody,
      device: rawBody.device || resolvedDevice,
      payload: enrichedPayload,
      country: rawBody.country || geoInfo.countryCode || null,
    })

    // ── Defer DB work until after the response is sent ────────────────────
    // after() is a Next.js 15+ API that runs the callback after the HTTP
    // response has been fully flushed to the client. It is serverless-safe:
    // no shared memory, no setInterval, no lost events.
    //
    // processAnalyticsEvent() never throws externally — errors are caught
    // internally and written to the DLQ.
    after(async () => {
      await processAnalyticsEvent(validated)
    })

    // ── Respond immediately ────────────────────────────────────────────────
    return NextResponse.json({ success: true, eventId: validated.eventId }, { status: 202 })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 })
    }
    console.error("[Analytics] Ingestion API Route Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
