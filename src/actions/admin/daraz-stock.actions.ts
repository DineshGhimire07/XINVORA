"use server"

import { SessionService } from "@/services/session.service"
import { DarazStockSyncService } from "@/services/daraz-stock-sync.service"
import { db } from "@/db"
import { darazStockReservations, darazSyncedProducts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/**
 * Admin action to trigger a full or batch inbound stock synchronization from Daraz
 */
export async function syncDarazStockAction() {
  await SessionService.requireAdmin()

  try {
    const result = await DarazStockSyncService.syncBatchStockFromDaraz()
    revalidatePath("/admin/products")
    revalidatePath("/admin/inventory")
    revalidatePath("/admin/daraz")

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to synchronize stock from Daraz",
    }
  }
}

/**
 * Admin action to release expired stock reservations
 */
export async function cleanExpiredReservationsAction() {
  await SessionService.requireAdmin()

  try {
    const released = await DarazStockSyncService.releaseExpiredReservations()
    return { success: true, releasedCount: released }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Admin action to get active stock reservations
 */
export async function getActiveReservationsAction() {
  await SessionService.requireAdmin()

  try {
    const reservations = await db
      .select()
      .from(darazStockReservations)
      .where(eq(darazStockReservations.status, "HELD"))
      .orderBy(desc(darazStockReservations.createdAt))
      .limit(50)

    return { success: true, data: reservations }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
