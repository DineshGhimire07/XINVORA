import { NextRequest, NextResponse } from "next/server"
import { userAgent } from "next/server"
import { IngestEventSchema, DeviceType, DeviceTypeType } from "@/features/analytics/events/registry"
import { IngestionService } from "@/features/analytics/ingestion/service"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    
    // Extract Client Metadata from Headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1"
    const ua = userAgent(req)
    
    // Map Next.js User-Agent device types to our DeviceTypeEnum
    let resolvedDevice: DeviceTypeType = DeviceType.DESKTOP
    if (ua.device.type === "mobile") {
      resolvedDevice = DeviceType.MOBILE
    } else if (ua.device.type === "tablet") {
      resolvedDevice = DeviceType.TABLET
    }
    
    // Construct default geoInfo/utmInfo placeholders or extract from request headers
    const geoInfo = {
      countryCode: req.headers.get("x-vercel-ip-country") || null,
      region: req.headers.get("x-vercel-ip-country-region") || null,
      city: req.headers.get("x-vercel-ip-city") || null,
      timezone: req.headers.get("x-vercel-ip-timezone") || null,
    }
    
    // Merge payload metadata
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
    
    // Validate with Zod
    const validated = IngestEventSchema.parse({
      ...rawBody,
      device: rawBody.device || resolvedDevice,
      payload: enrichedPayload,
      country: rawBody.country || geoInfo.countryCode || null,
    })
    
    // Enqueue event in buffer pipeline
    IngestionService.enqueue(validated)
    
    // Respond immediately with 202 Accepted to minimize client latency
    return NextResponse.json({ success: true, eventId: validated.eventId }, { status: 202 })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 })
    }
    console.error("Ingestion API Route Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
