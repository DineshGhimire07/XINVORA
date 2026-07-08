import { eq, sql, and } from "drizzle-orm"
import { db } from "@/db/client"
import { inventory } from "@/db/schema"

export class InventoryService {
  /**
   * Reserves inventory atomically. Ensures the current quantity satisfies the request.
   * Can be executed within a given transaction context.
   */
  static async reserveStock(variantId: string, quantity: number, txClient?: any): Promise<boolean> {
    const client = txClient || db
    const result = await client
      .update(inventory)
      .set({ quantity: sql`${inventory.quantity} - ${quantity}` })
      .where(
        and(
          eq(inventory.variantId, variantId),
          sql`${inventory.quantity} >= ${quantity}`
        )
      )
      .returning({ id: inventory.id })
      
    return result.length > 0
  }

  /**
   * Adjusts stock by a delta. Used by Admin tools for manual updates.
   * Delta can be positive or negative. Throws if resulting quantity would be negative.
   */
  static async adjustStock(id: string, delta: number, txClient?: any) {
    const client = txClient || db
    
    const [currentInv] = await client
      .select({ quantity: inventory.quantity })
      .from(inventory)
      .where(eq(inventory.id, id))
      .for("update")

    if (!currentInv) {
      throw new Error("Inventory record not found")
    }

    const nextQuantity = currentInv.quantity + delta
    if (nextQuantity < 0) {
      throw new Error("Inventory quantity cannot be negative.")
    }

    const [updatedInv] = await client
      .update(inventory)
      .set({ 
        quantity: sql`${inventory.quantity} + ${delta}`,
        updatedAt: new Date() 
      })
      .where(eq(inventory.id, id))
      .returning()

    return { updatedInv, nextQuantity }
  }
}
