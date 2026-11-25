import { NextRequest, NextResponse } from "next/server"
import { DarazStockSyncService } from "@/services/daraz-stock-sync.service"

export const dynamic = "force-dynamic"

/**
 * Scheduled Stock Synchronization Cron Job
 *
 * Runs on a periodic schedule (e.g. every 15-30 minutes) to:
 * 1. Clean up and restore any expired stock reservations older than 15 minutes.
 * 2. Inbound delta poll Daraz Open Platform to sync stock levels.
 * 3. Enforce double-deduction prevention formulas.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Secure cron endpoint when CRON_SECRET is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Clean up expired reservations
    const expiredCount = await DarazStockSyncService.releaseExpiredReservations()

    // 2. Run inbound stock synchronization
    const syncResult = await DarazStockSyncService.syncBatchStockFromDaraz({
      batchSize: 50,
      maxProducts: 500,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredReservationsReleased: expiredCount,
      syncResult,
    })
  } catch (err: any) {
    console.error("[Cron Daraz Stock Sync Error]:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute scheduled stock sync",
      },
      { status: 500 }
    )
  }
}
