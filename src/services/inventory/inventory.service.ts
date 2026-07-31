/**
 * services/inventory/inventory.service.ts — XINVORA Inventory Write Service
 *
 * Owns ALL business rules for adjusting product variant inventory.
 * Guaranteed atomic transaction handling to prevent overselling under high concurrency.
 */

import "server-only"
import { eq, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { inventory } from "@/db/schema"
import { DomainError, DomainErrorCode } from "../errors"

// ── Types ─────────────────────────────────────────────────────────────────────

export type InventoryAdjustmentType =
  | "RESTOCK"       // Physical goods arrived; increases quantity
  | "RESERVE"       // Item added to cart; increases reserved
  | "RELEASE"       // Item removed from cart; decreases reserved
  | "FULFILL"       // Order shipped; decreases both quantity and reserved
  | "CORRECTION"    // Manual admin correction; sets absolute quantity

export interface AdjustInventoryInput {
  variantId: string
  type: InventoryAdjustmentType
  delta: number // Positive for RESTOCK/RESERVE; positive for RELEASE/FULFILL means "release this many"
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveStatus(
  quantity: number,
  threshold: number
): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (quantity <= 0) return "OUT_OF_STOCK"
  if (quantity <= threshold) return "LOW_STOCK"
  return "IN_STOCK"
}

// ── Service ───────────────────────────────────────────────────────────────────

const InventoryService = {
  /**
   * Adjust inventory for a variant according to the adjustment type.
   * Runs inside an atomic database transaction with SELECT ... FOR UPDATE row locking.
   *
   * @throws {DomainError} INVENTORY_NOT_FOUND — variant has no inventory record
   * @throws {DomainError} INVENTORY_NEGATIVE_QUANTITY — would result in qty < 0
   * @throws {DomainError} INVENTORY_INSUFFICIENT_STOCK — not enough unreserved stock to reserve
   * @throws {DomainError} INVENTORY_RELEASE_EXCEEDS_RESERVED — releasing more than reserved
   */
  async adjustStock(input: AdjustInventoryInput): Promise<void> {
    const { variantId, type, delta } = input

    if (delta <= 0 && type !== "CORRECTION") {
      throw new DomainError(
        DomainErrorCode.INVENTORY_NEGATIVE_QUANTITY,
        "Delta must be a positive number."
      )
    }

    // Atomic transaction with row-level locking
    await db.transaction(async (tx) => {
      // Row-level locking to serialize concurrent stock modifications on the same variant
      const records = await tx
        .select()
        .from(inventory)
        .where(eq(inventory.variantId, variantId))
        .for("update")
        .limit(1)

      const record = records[0]

      if (!record) {
        throw new DomainError(
          DomainErrorCode.INVENTORY_NOT_FOUND,
          `No inventory record found for variant ${variantId}.`
        )
      }

      let newQuantity = record.quantity
      let newReserved = record.reserved

      switch (type) {
        case "RESTOCK":
          newQuantity = record.quantity + delta
          break

        case "RESERVE": {
          const available = record.quantity - record.reserved
          if (delta > available) {
            throw new DomainError(
              DomainErrorCode.INVENTORY_INSUFFICIENT_STOCK,
              `Cannot reserve ${delta} units — only ${available} available.`
            )
          }
          newReserved = record.reserved + delta
          break
        }

        case "RELEASE":
          if (delta > record.reserved) {
            throw new DomainError(
              DomainErrorCode.INVENTORY_RELEASE_EXCEEDS_RESERVED,
              `Cannot release ${delta} units — only ${record.reserved} are reserved.`
            )
          }
          newReserved = record.reserved - delta
          break

        case "FULFILL":
          if (delta > record.quantity) {
            throw new DomainError(
              DomainErrorCode.INVENTORY_NEGATIVE_QUANTITY,
              `Cannot fulfill ${delta} units — only ${record.quantity} in stock.`
            )
          }
          newQuantity = record.quantity - delta
          newReserved = Math.max(0, record.reserved - delta)
          break

        case "CORRECTION":
          if (delta < 0) {
            throw new DomainError(
              DomainErrorCode.INVENTORY_NEGATIVE_QUANTITY,
              "Corrected quantity must be non-negative."
            )
          }
          newQuantity = delta
          newReserved = Math.min(record.reserved, newQuantity)
          break
      }

      const newStatus = deriveStatus(newQuantity, record.lowStockThreshold)

      await tx
        .update(inventory)
        .set({
          quantity: newQuantity,
          reserved: newReserved,
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, variantId))
    })
  },
}

export { InventoryService }
