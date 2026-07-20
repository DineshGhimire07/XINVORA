import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/services/analytics.service"
import { trackEventSchema } from "@/validations/analytics"
import { z } from "zod"

const batchPayloadSchema = z.object({
  events: z.array(trackEventSchema),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = batchPayloadSchema.parse(body)

    await AnalyticsService.recordEventsBatch(parsed.events)

    return NextResponse.json({ success: true, count: parsed.events.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
