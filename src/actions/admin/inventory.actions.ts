"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { AdminInventoryService } from "@/services/admin.inventory.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"
import { db } from "@/db/client"
import { inventory, variants } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Set absolute stock quantity on an inventory record.
 */
export async function setVariantStockAction(input: {
  inventoryId: string
  quantity: number
  lowStockThreshold?: number
  reason?: string
}) {
  try {
    const session = await SessionService.requireAdmin()

    if (input.quantity < 0) {
      return { success: false, error: "Stock quantity cannot be negative." }
    }

    const updated = await AdminInventoryService.setStockQuantity(
      input.inventoryId,
      input.quantity,
      session.id,
      input.lowStockThreshold,
      input.reason
    )

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    revalidateTag("inventory", "default")
    revalidateTag("products", "default")
    revalidateTag("dashboard", "default")

    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update stock quantity." }
  }
}

/**
 * Adjust stock by delta (+/-).
 */
export async function quickAdjustStockAction(input: {
  inventoryId: string
  delta: number
  reason?: string
}) {
  try {
    const session = await SessionService.requireAdmin()

    const updated = await AdminInventoryService.adjustStock(
      input.inventoryId,
      input.delta,
      session.id,
      input.reason
    )

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    revalidateTag("inventory", "default")
    revalidateTag("products", "default")
    revalidateTag("dashboard", "default")

    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to adjust stock." }
  }
}

/**
 * Bulk set stock for multiple inventory items.
 */
export async function bulkSetStockAction(input: {
  items: { inventoryId: string; quantity: number }[]
  reason?: string
}) {
  try {
    const session = await SessionService.requireAdmin()

    const updated = await AdminInventoryService.bulkSetStock(
      input.items,
      session.id,
      input.reason
    )

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    revalidateTag("inventory", "default")
    revalidateTag("products", "default")
    revalidateTag("dashboard", "default")

    return { success: true, count: updated.length }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to bulk update stock." }
  }
}

/**
 * Delete / Remove obsolete variant and inventory record.
 */
export async function deleteInventoryAction(inventoryId: string) {
  try {
    await SessionService.requireAdmin()

    // Find the variantId
    const [inv] = await db
      .select({ variantId: inventory.variantId })
      .from(inventory)
      .where(eq(inventory.id, inventoryId))
      .limit(1)

    if (inv) {
      // Delete variant (cascades to inventory and priceBookEntries)
      await db.delete(variants).where(eq(variants.id, inv.variantId))
    } else {
      await db.delete(inventory).where(eq(inventory.id, inventoryId))
    }

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    revalidateTag("inventory", "default")
    revalidateTag("products", "default")
    revalidateTag("dashboard", "default")

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete inventory" }
  }
}

/**
 * Master Sync & Health Clean Action.
 */
export async function syncAndCleanInventoryAction() {
  try {
    const session = await SessionService.requireAdmin()
    const result = await AdminInventoryService.syncAndCleanInventory(session.id)

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    revalidateTag("inventory", "default")
    revalidateTag("products", "default")
    revalidateTag("dashboard", "default")

    return result
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sync inventory." }
  }
}
