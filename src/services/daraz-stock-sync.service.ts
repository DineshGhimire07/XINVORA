import { db } from "../db/client"
import {
  darazSyncedProducts,
  darazStockReservations,
  darazSyncLogs,
  inventory,
  variants,
} from "../db/schema"
import { eq, and, sql, lt, inArray } from "drizzle-orm"
import { DarazService } from "./daraz.service"
import { DarazCatalogueImporter, DarazProductItem } from "./daraz-catalogue-importer.service"

export interface StockReservationResult {
  success: boolean
  reservationId?: string
  sellerSku: string
  availableStock: number
  reservedQuantity: number
  error?: string
}

export interface OutboundStockSyncResult {
  success: boolean
  darazItemId: string
  skuId: string
  sellerSku: string
  previousQuantity: number
  newQuantity: number
  requestId?: string
  error?: string
}

export class DarazStockSyncService {
  /**
   * Cleans up expired reservations (older than 15 minutes and still in HELD status)
   */
  public static async releaseExpiredReservations(): Promise<number> {
    const now = new Date()

    // Find all expired HELD reservations
    const expired = await db
      .select()
      .from(darazStockReservations)
      .where(and(eq(darazStockReservations.status, "HELD"), lt(darazStockReservations.expiresAt, now)))

    if (expired.length === 0) return 0

    let releasedCount = 0
    for (const res of expired) {
      // 1. Release reservation record
      await db
        .update(darazStockReservations)
        .set({ status: "RELEASED", updatedAt: new Date() })
        .where(eq(darazStockReservations.id, res.id))

      // 2. Reconcile daraz_synced_products pending reservations
      const [synced] = await db
        .select()
        .from(darazSyncedProducts)
        .where(eq(darazSyncedProducts.sellerSku, res.sellerSku))
        .limit(1)

      if (synced) {
        const newPending = Math.max(0, synced.pendingReservations - res.reservedQuantity)
        const newAvailable = Math.max(0, synced.darazStock - newPending)

        await db
          .update(darazSyncedProducts)
          .set({
            pendingReservations: newPending,
            websiteAvailableStock: newAvailable,
            updatedAt: new Date(),
          })
          .where(eq(darazSyncedProducts.id, synced.id))

        // 3. Restore inventory quantity on website variant
        if (synced.websiteVariantId) {
          const invStatus = newAvailable > 0 ? (newAvailable <= 5 ? "LOW_STOCK" : "IN_STOCK") : "OUT_OF_STOCK"
          await db
            .update(inventory)
            .set({
              quantity: newAvailable,
              status: invStatus,
              updatedAt: new Date(),
            })
            .where(eq(inventory.variantId, synced.websiteVariantId))
        }
      }
      releasedCount++
    }

    return releasedCount
  }

  /**
   * Atomically reserves stock on XINVORA during checkout initiation to prevent overselling.
   * Uses database transaction and row-level locking (FOR UPDATE) to guarantee concurrency safety.
   */
  public static async reserveStock(
    sellerSku: string,
    quantity = 1,
    orderId?: string,
    ttlMinutes = 15
  ): Promise<StockReservationResult> {
    // 1. Run expiration cleaner first
    await this.releaseExpiredReservations()

    // 2. Atomic transaction with row locking
    const result = await db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(darazSyncedProducts)
        .where(eq(darazSyncedProducts.sellerSku, sellerSku))
        .for("update")

      if (!product) {
        return {
          success: false,
          sellerSku,
          availableStock: 0,
          reservedQuantity: 0,
          error: "Product SKU not found in synchronized inventory",
        }
      }

      const currentAvailable = product.websiteAvailableStock
      if (currentAvailable < quantity) {
        return {
          success: false,
          sellerSku,
          availableStock: currentAvailable,
          reservedQuantity: 0,
          error: `Insufficient stock: only ${currentAvailable} available, requested ${quantity}`,
        }
      }

      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

      // 3. Create persistent reservation record
      const [reservation] = await tx
        .insert(darazStockReservations)
        .values({
          orderId: orderId || null,
          sellerSku,
          variantId: product.websiteVariantId || null,
          reservedQuantity: quantity,
          status: "HELD",
          expiresAt,
        })
        .returning({ id: darazStockReservations.id })

      // 4. Update daraz_synced_products available stock
      const newPending = product.pendingReservations + quantity
      const newAvailable = Math.max(0, product.darazStock - newPending)

      await tx
        .update(darazSyncedProducts)
        .set({
          pendingReservations: newPending,
          websiteAvailableStock: newAvailable,
          updatedAt: new Date(),
        })
        .where(eq(darazSyncedProducts.id, product.id))

      // 5. Update native storefront inventory
      if (product.websiteVariantId) {
        const invStatus = newAvailable > 0 ? (newAvailable <= 5 ? "LOW_STOCK" : "IN_STOCK") : "OUT_OF_STOCK"
        await tx
          .update(inventory)
          .set({
            quantity: newAvailable,
            status: invStatus,
            updatedAt: new Date(),
          })
          .where(eq(inventory.variantId, product.websiteVariantId))
      }

      return {
        success: true,
        reservationId: reservation.id,
        sellerSku,
        availableStock: newAvailable,
        reservedQuantity: quantity,
      }
    })

    return result
  }

  /**
   * Releases a reservation (e.g., when payment fails, order is cancelled, or cart emptied)
   * Uses transaction and row-level locking.
   */
  public static async releaseReservation(reservationId: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [res] = await tx
        .select()
        .from(darazStockReservations)
        .where(eq(darazStockReservations.id, reservationId))
        .for("update")

      if (!res || res.status === "RELEASED") {
        return false
      }

      await tx
        .update(darazStockReservations)
        .set({ status: "RELEASED", updatedAt: new Date() })
        .where(eq(darazStockReservations.id, reservationId))

      const [product] = await tx
        .select()
        .from(darazSyncedProducts)
        .where(eq(darazSyncedProducts.sellerSku, res.sellerSku))
        .for("update")

      if (product) {
        const newPending = Math.max(0, product.pendingReservations - res.reservedQuantity)
        const newAvailable = Math.max(0, product.darazStock - newPending)

        await tx
          .update(darazSyncedProducts)
          .set({
            pendingReservations: newPending,
            websiteAvailableStock: newAvailable,
            updatedAt: new Date(),
          })
          .where(eq(darazSyncedProducts.id, product.id))

        if (product.websiteVariantId) {
          const invStatus = newAvailable > 0 ? (newAvailable <= 5 ? "LOW_STOCK" : "IN_STOCK") : "OUT_OF_STOCK"
          await tx
            .update(inventory)
            .set({
              quantity: newAvailable,
              status: invStatus,
              updatedAt: new Date(),
            })
            .where(eq(inventory.variantId, product.websiteVariantId))
        }
      }

      return true
    })
  }

  /**
   * Confirms payment and triggers outbound stock synchronization to Daraz
   */
  public static async confirmAndDeductStock(
    reservationId: string,
    options: { dryRun?: boolean } = {}
  ): Promise<OutboundStockSyncResult> {
    const [res] = await db
      .select()
      .from(darazStockReservations)
      .where(eq(darazStockReservations.id, reservationId))
      .limit(1)

    if (!res) {
      throw new Error(`Reservation ${reservationId} not found`)
    }

    const [product] = await db
      .select()
      .from(darazSyncedProducts)
      .where(eq(darazSyncedProducts.sellerSku, res.sellerSku))
      .limit(1)

    if (!product) {
      throw new Error(`Synced product for SKU ${res.sellerSku} not found`)
    }

    // Double deduction prevention: New Daraz stock will be Daraz stock minus reserved quantity
    const newDarazStock = Math.max(0, product.darazStock - res.reservedQuantity)

    let requestId = `DRY-RUN-${Date.now()}`
    if (!options.dryRun) {
      // Send verified update to Daraz API: /product/price_quantity/update
      const payloadXml = `
<Request>
  <Product>
    <Skus>
      <Sku>
        <ItemId>${product.darazItemId}</ItemId>
        <SkuId>${product.skuId}</SkuId>
        <SellerSku>${product.sellerSku}</SellerSku>
        <Quantity>${newDarazStock}</Quantity>
      </Sku>
    </Skus>
  </Product>
</Request>`.trim()

      const token = await DarazService.getValidAccessToken()
      const apiRes = await (DarazService as any).client.execute(
        "/product/price_quantity/update",
        { payload: payloadXml },
        { accessToken: token, method: "POST" }
      )

      requestId = apiRes.request_id || apiRes._trace_id_ || "OK"

      // Audit log
      await db.insert(darazSyncLogs).values({
        syncType: "STOCK_PUSH",
        darazItemId: product.darazItemId,
        sellerSku: product.sellerSku,
        previousValues: { darazStock: product.darazStock },
        updatedValues: { darazStock: newDarazStock, requestId },
        status: "SUCCESS",
        details: `Successfully pushed stock update to Daraz. New stock: ${newDarazStock}`,
      })
    }

    // Mark reservation as DEDUCTED_ON_DARAZ and reconcile internal counts
    await db
      .update(darazStockReservations)
      .set({ status: "DEDUCTED_ON_DARAZ", updatedAt: new Date() })
      .where(eq(darazStockReservations.id, reservationId))

    const newPending = Math.max(0, product.pendingReservations - res.reservedQuantity)
    const newAvailable = Math.max(0, newDarazStock - newPending)

    await db
      .update(darazSyncedProducts)
      .set({
        darazStock: newDarazStock,
        pendingReservations: newPending,
        websiteAvailableStock: newAvailable,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(darazSyncedProducts.id, product.id))

    return {
      success: true,
      darazItemId: product.darazItemId,
      skuId: product.skuId,
      sellerSku: product.sellerSku,
      previousQuantity: product.darazStock,
      newQuantity: newDarazStock,
      requestId,
    }
  }

  /**
   * Inbound Stock Sync: Pulls stock updates from Daraz and applies Double-Deduction Prevention
   */
  public static async syncInboundStockFromDaraz(
    darazItemId: string,
    skuId: string,
    freshDarazStock: number
  ): Promise<{
    sellerSku: string
    darazStock: number
    pendingReservations: number
    websiteAvailableStock: number
    inventoryStatus: string
  }> {
    // 1. Release any expired reservations
    await this.releaseExpiredReservations()

    // 2. Fetch current record
    const [product] = await db
      .select()
      .from(darazSyncedProducts)
      .where(and(eq(darazSyncedProducts.darazItemId, darazItemId), eq(darazSyncedProducts.skuId, skuId)))
      .limit(1)

    if (!product) {
      throw new Error(`Item ${darazItemId} SKU ${skuId} not found in daraz_synced_products`)
    }

    // 3. Double-Deduction Prevention Formula:
    // If Daraz reports a lower stock because an XINVORA order was just deducted on Daraz,
    // active reservations are already decremented.
    // Available stock = Max(0, freshDarazStock - activePendingReservations)
    const activePending = product.pendingReservations
    const newAvailable = Math.max(0, freshDarazStock - activePending)
    const invStatus = newAvailable > 0 ? (newAvailable <= 5 ? "LOW_STOCK" : "IN_STOCK") : "OUT_OF_STOCK"

    // 4. Update daraz_synced_products
    await db
      .update(darazSyncedProducts)
      .set({
        darazStock: freshDarazStock,
        websiteAvailableStock: newAvailable,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(darazSyncedProducts.id, product.id))

    // 5. Update native storefront inventory
    if (product.websiteVariantId) {
      await db
        .update(inventory)
        .set({
          quantity: newAvailable,
          status: invStatus,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, product.websiteVariantId))
    }

    return {
      sellerSku: product.sellerSku,
      darazStock: freshDarazStock,
      pendingReservations: activePending,
      websiteAvailableStock: newAvailable,
      inventoryStatus: invStatus,
    }
  }

  /**
   * Batch Inbound Stock Synchronization:
   * Polls Daraz Open Platform (/products/get), reads SKU stock levels,
   * reconciles active reservations, and updates website inventory.
   */
  public static async syncBatchStockFromDaraz(options: {
    maxProducts?: number
    batchSize?: number
  } = {}): Promise<{
    totalProductsChecked: number
    totalSkusUpdated: number
    discrepanciesFound: number
    errors: string[]
  }> {
    const batchSize = options.batchSize || 50
    const maxProducts = options.maxProducts || 1000
    let offset = 0
    let totalChecked = 0
    let totalUpdated = 0
    let discrepanciesFound = 0
    const errors: string[] = []

    // 1. First, release any expired reservations
    const expiredCount = await this.releaseExpiredReservations()
    if (expiredCount > 0) {
      console.log(`[DarazStockSync] Released ${expiredCount} expired stock reservations.`)
    }

    // 2. Fetch pages from Daraz
    let hasMore = true
    while (hasMore && totalChecked < maxProducts) {
      try {
        const page = await DarazCatalogueImporter.fetchProductsPage(offset, batchSize, "all")
        if (!page.products || page.products.length === 0) {
          hasMore = false
          break
        }

        for (const product of page.products) {
          totalChecked++
          const itemId = String(product.item_id)
          const skus = product.skus || []

          for (const sku of skus) {
            const skuId = String(sku.SkuId || "")
            if (!skuId) continue

            const rawQuantity = sku.quantity ?? sku.Available ?? 0
            const freshStock = Math.max(0, Number(rawQuantity) || 0)

            try {
              // Check current recorded stock before updating
              const [current] = await db
                .select({
                  darazStock: darazSyncedProducts.darazStock,
                  websiteAvailableStock: darazSyncedProducts.websiteAvailableStock,
                })
                .from(darazSyncedProducts)
                .where(
                  and(
                    eq(darazSyncedProducts.darazItemId, itemId),
                    eq(darazSyncedProducts.skuId, skuId)
                  )
                )
                .limit(1)

              if (current && current.darazStock !== freshStock) {
                discrepanciesFound++
              }

              if (current) {
                await this.syncInboundStockFromDaraz(itemId, skuId, freshStock)
                totalUpdated++
              }
            } catch (skuErr: any) {
              errors.push(`Item ${itemId} SKU ${skuId}: ${skuErr.message}`)
            }
          }
        }

        offset += page.products.length
        if (offset >= page.total || page.products.length < batchSize) {
          hasMore = false
        }
      } catch (pageErr: any) {
        errors.push(`Page fetch error at offset ${offset}: ${pageErr.message}`)
        hasMore = false
      }
    }

    // 3. Log sync operation to audit log
    await db.insert(darazSyncLogs).values({
      syncType: "STOCK_PULL",
      status: errors.length === 0 ? "SUCCESS" : "PARTIAL",
      details: `Inbound stock sync completed. Checked ${totalChecked} products, updated ${totalUpdated} SKUs, found ${discrepanciesFound} stock changes.`,
      updatedValues: {
        totalChecked,
        totalUpdated,
        discrepanciesFound,
        errorCount: errors.length,
      },
    })

    return {
      totalProductsChecked: totalChecked,
      totalSkusUpdated: totalUpdated,
      discrepanciesFound,
      errors,
    }
  }
}
