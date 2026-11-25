"use server"

import { SessionService } from "@/services/session.service"
import { DarazStockSyncService } from "@/services/daraz-stock-sync.service"
import { db } from "@/db"
import { darazStockReservations, darazSyncedProducts, darazSyncLogs } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDarazProductWithSkus } from "@/db/queries/daraz-inventory"

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
    revalidatePath("/admin/daraz/inventory")

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
    revalidatePath("/admin/daraz/inventory")
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

/**
 * Safely releases an individual stock reservation
 */
export async function releaseReservationAction(reservationId: string) {
  await SessionService.requireAdmin()

  if (!reservationId) {
    return { success: false, error: "Reservation ID is required" }
  }

  try {
    const released = await DarazStockSyncService.releaseReservation(reservationId)
    if (!released) {
      return { success: false, error: "Reservation not found or already released" }
    }

    revalidatePath("/admin/daraz/inventory")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to release reservation" }
  }
}

/**
 * Safely and idempotently retries a failed synchronization operation
 */
export async function retryFailedSyncAction(logId: string) {
  await SessionService.requireAdmin()

  try {
    const [log] = await db
      .select()
      .from(darazSyncLogs)
      .where(eq(darazSyncLogs.id, logId))
      .limit(1)

    if (!log) {
      return { success: false, error: "Sync log record not found" }
    }

    // If it was a stock push or pull for a specific item, re-sync that item
    if (log.darazItemId && log.sellerSku) {
      const [product] = await db
        .select()
        .from(darazSyncedProducts)
        .where(eq(darazSyncedProducts.sellerSku, log.sellerSku))
        .limit(1)

      if (product) {
        // Safe idempotent resync
        await DarazStockSyncService.syncInboundStockFromDaraz(
          product.darazItemId,
          product.skuId,
          product.darazStock
        )
      }
    } else {
      // General batch sync retry
      await DarazStockSyncService.syncBatchStockFromDaraz({ batchSize: 50 })
    }

    // Mark previous error log as resolved
    await db
      .update(darazSyncLogs)
      .set({
        status: "RESOLVED",
        details: `${log.details || ""} [Manually retried and resolved by admin at ${new Date().toISOString()}]`,
      })
      .where(eq(darazSyncLogs.id, logId))

    revalidatePath("/admin/daraz/inventory")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retry synchronization" }
  }
}

/**
 * Fetches full details for a Daraz product and all its SKUs
 */
export async function getDarazProductDetailAction(darazItemId: string) {
  await SessionService.requireAdmin()

  try {
    const data = await getDarazProductWithSkus(darazItemId)
    if (!data) {
      return { success: false, error: "Product not found" }
    }
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch product details" }
  }
}
