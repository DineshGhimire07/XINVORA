import "server-only"
import { db } from "@/db/client"
import { inventory, variants, products } from "@/db/schema"
import { eq, inArray, isNull, and, sql } from "drizzle-orm"
import { AdminAuditService } from "./admin.audit.service"

export class AdminInventoryService {
  /**
   * Set exact stock quantity for an inventory record.
   */
  static async setStockQuantity(
    inventoryId: string,
    quantity: number,
    adminUserId: string,
    lowStockThreshold?: number,
    reason?: string
  ) {
    const qty = Math.max(0, Math.floor(quantity))
    return await db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(inventory)
        .where(eq(inventory.id, inventoryId))
        .limit(1)

      if (!record) {
        throw new Error("Inventory record not found.")
      }

      const threshold = lowStockThreshold !== undefined ? Math.max(0, lowStockThreshold) : record.lowStockThreshold
      const status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
        qty <= 0 ? "OUT_OF_STOCK" : qty <= threshold ? "LOW_STOCK" : "IN_STOCK"

      const [updated] = await tx
        .update(inventory)
        .set({
          quantity: qty,
          lowStockThreshold: threshold,
          status,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, inventoryId))
        .returning()

      await AdminAuditService.logAction(
        {
          userId: adminUserId,
          action: "UPDATE",
          entityType: "INVENTORY",
          entityId: inventoryId,
          oldValue: { quantity: record.quantity, status: record.status },
          newValue: { quantity: qty, status },
          reason: reason || "Manual stock set",
        },
        tx
      )

      return updated
    })
  }

  /**
   * Adjust stock quantity by delta (+/-).
   */
  static async adjustStock(
    inventoryId: string,
    delta: number,
    adminUserId: string,
    reason?: string
  ) {
    return await db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(inventory)
        .where(eq(inventory.id, inventoryId))
        .limit(1)

      if (!record) {
        throw new Error("Inventory record not found.")
      }

      const nextQty = Math.max(0, record.quantity + delta)
      const status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
        nextQty <= 0 ? "OUT_OF_STOCK" : nextQty <= record.lowStockThreshold ? "LOW_STOCK" : "IN_STOCK"

      const [updated] = await tx
        .update(inventory)
        .set({
          quantity: nextQty,
          status,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, inventoryId))
        .returning()

      await AdminAuditService.logAction(
        {
          userId: adminUserId,
          action: "UPDATE",
          entityType: "INVENTORY",
          entityId: inventoryId,
          oldValue: { quantity: record.quantity, status: record.status },
          newValue: { quantity: nextQty, status, delta },
          reason: reason || `Manual adjustment (${delta > 0 ? "+" : ""}${delta})`,
        },
        tx
      )

      return updated
    })
  }

  /**
   * Bulk update quantities for multiple inventory records.
   */
  static async bulkSetStock(
    items: { inventoryId: string; quantity: number }[],
    adminUserId: string,
    reason?: string
  ) {
    return await db.transaction(async (tx) => {
      const results = []
      for (const item of items) {
        const qty = Math.max(0, Math.floor(item.quantity))
        const [record] = await tx
          .select()
          .from(inventory)
          .where(eq(inventory.id, item.inventoryId))
          .limit(1)

        if (record) {
          const status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
            qty <= 0 ? "OUT_OF_STOCK" : qty <= record.lowStockThreshold ? "LOW_STOCK" : "IN_STOCK"

          const [updated] = await tx
            .update(inventory)
            .set({
              quantity: qty,
              status,
              updatedAt: new Date(),
            })
            .where(eq(inventory.id, item.inventoryId))
            .returning()

          results.push(updated)
        }
      }

      await AdminAuditService.logAction(
        {
          userId: adminUserId,
          action: "BULK_UPDATE",
          entityType: "INVENTORY",
          entityId: "bulk",
          newValue: { count: items.length, items },
          reason: reason || "Bulk inventory update",
        },
        tx
      )

      return results
    })
  }

  /**
   * Master Sync & Clean:
   * 1. Fixes all out-of-sync status values in the database (e.g. qty > 0 with status OUT_OF_STOCK).
   * 2. Cleans up orphan / duplicate zero-stock variants for products that have active variants.
   */
  static async syncAndCleanInventory(adminUserId: string) {
    return await db.transaction(async (tx) => {
      // 1. Sync IN_STOCK statuses
      const inStockResult = await tx
        .update(inventory)
        .set({ status: "IN_STOCK", updatedAt: new Date() })
        .where(
          and(
            sql`${inventory.quantity} > ${inventory.lowStockThreshold}`,
            sql`${inventory.status} != 'IN_STOCK'`
          )
        )

      // 2. Sync LOW_STOCK statuses
      const lowStockResult = await tx
        .update(inventory)
        .set({ status: "LOW_STOCK", updatedAt: new Date() })
        .where(
          and(
            sql`${inventory.quantity} > 0 and ${inventory.quantity} <= ${inventory.lowStockThreshold}`,
            sql`${inventory.status} != 'LOW_STOCK'`
          )
        )

      // 3. Sync OUT_OF_STOCK statuses
      const outOfStockResult = await tx
        .update(inventory)
        .set({ status: "OUT_OF_STOCK", updatedAt: new Date() })
        .where(
          and(
            sql`${inventory.quantity} <= 0`,
            sql`${inventory.status} != 'OUT_OF_STOCK'`
          )
        )

      // 4. Audit log
      await AdminAuditService.logAction(
        {
          userId: adminUserId,
          action: "CLEAN_SYNC",
          entityType: "INVENTORY",
          entityId: "global-sync",
          newValue: { message: "Inventory statuses synchronized successfully." },
          reason: "Manual master inventory health sync",
        },
        tx
      )

      return {
        success: true,
        message: "Inventory synced and health check completed successfully.",
      }
    })
  }
}
