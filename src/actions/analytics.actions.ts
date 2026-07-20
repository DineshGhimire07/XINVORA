"use client"
"use server"

import { AnalyticsService } from "@/services/analytics.service"
import { searchRecordSchema } from "@/validations/analytics"
import { SessionService } from "@/services/session.service"

export async function recordSearchAction(input: any) {
  try {
    const parsed = searchRecordSchema.parse(input)
    const { userId, sessionId } = await SessionService.getCommerceIdentity()

    await AnalyticsService.recordSearch({
      query: parsed.query,
      resultsCount: parsed.resultsCount,
      userId: userId || undefined,
      sessionId: sessionId || undefined,
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: { message: err.message || "Failed to record search" } }
  }
}
