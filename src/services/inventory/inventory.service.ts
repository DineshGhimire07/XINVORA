/**
 * services/inventory/inventory.service.ts — XINVORA Inventory Write Service
 *
 * Owns ALL business rules for adjusting product variant inventory.
 *
 * This is a REAL, partially implemented service — unlike the product/category/
 * collection stubs, inventory adjustment logic is needed by the Cart and
 * Checkout phases (Phase 5) so the interface and rules are codified now.
 *
 * TRANSACTION STRATEGY:
 * adjustStock() — MUST be transactional in production.
 *   Read current quantity + reserved, validate delta, write new values.
 *   Without a transaction, two concurrent cart additions could both read
 *   quantity=1 and both succeed, resulting in overselling.
 *
 *   Implementation should use Drizzle's db.transaction() or a database-level
 *   advisory lock. See TODO comment in adjustStock().
 *
 * BUSINESS RULES:
 * - Physical quantity may never go below 0.
 * - Reserved quantity may never exceed physical quantity.
 * - Released reservations may never exceed the current reserved count.
 * - Inventory status (IN_STOCK / LOW_STOCK / OUT_OF_STOCK) is derived
 *   automatically from quantity and lowStockThreshold — never set manually.
 */

import "server-only"
import { eq } from "drizzle-orm"
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
   *
   * IMPORTANT: In production this must run inside a database transaction
   * to prevent race conditions (overselling). The TODO below marks where
   * db.transaction() should wrap the read-modify-write cycle.
   *
   * @throws {DomainError} INVENTORY_NOT_FOUND — variant has no inventory record
   * @throws {DomainError} INVENTORY_NEGATIVE_QUANTITY — would result in qty < 0
   * @throws {DomainError} INVENTORY_INSUFFICIENT_STOCK — not enough unresrved stock to reserve
   * @throws {DomainError} INVENTORY_RELEASE_EXCEEDS_RESERVED — releasing more than reserved
   */
  async adjustStock(input: AdjustInventoryInput): Promise<void> {
    const { variantId, type, delta } = input

    if (delta <= 0) {
      throw new DomainError(
        DomainErrorCode.INVENTORY_NEGATIVE_QUANTITY,
        "Delta must be a positive number."
      )
    }

    // TODO (Phase 5): Wrap this entire block in db.transaction(async (tx) => { ... })
    // to prevent overselling under concurrent cart operations.

    const record = await db.query.inventory.findFirst({
      where: eq(inventory.variantId, variantId),
    })

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
        // Also release the corresponding reservation
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
        // Reset reserved if correction brings quantity below current reserved
        newReserved = Math.min(record.reserved, newQuantity)
        break
    }

    const newStatus = deriveStatus(newQuantity, record.lowStockThreshold)

    await db
      .update(inventory)
      .set({
        quantity: newQuantity,
        reserved: newReserved,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(inventory.variantId, variantId))
  },
}

export { InventoryService }
