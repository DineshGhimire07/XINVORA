import { eq, sql, and } from "drizzle-orm"
import { db } from "../client"
import { orders, orderItems, inventory, coupons, cartItems, addresses } from "../schema"
import { InventoryService } from "../../services/inventory.service"

export class CheckoutRepository {
  /**
   * Executes a callback within a Drizzle transaction.
   */
  static async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await db.transaction(callback)
  }
  /**
   * Locks the coupon row for updates within the current transaction context.
   */
  static async lockCoupon(tx: any, code: string) {
    const result = await tx
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .for("update")
    return result[0] ?? null
  }

  /**
   * Counts how many times this user has used this coupon.
   */
  static async countUserCouponUses(tx: any, userId: string, couponId: string): Promise<number> {
    const client = tx || db
    const result = await client
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.couponId, couponId)
        )
      )
    return Number(result[0]?.count ?? 0)
  }

  /**
   * Creates an order record within the current transaction context.
   */
  static async createOrder(tx: any, data: any) {
    const [newOrder] = await tx
      .insert(orders)
      .values(data)
      .returning({ id: orders.id })
    return newOrder
  }

  /**
   * Batch inserts order items within the current transaction context.
   */
  static async createOrderItems(tx: any, items: any[]) {
    await tx.insert(orderItems).values(items)
  }

  static async reserveInventory(tx: any, variantId: string, quantity: number): Promise<boolean> {
    return await InventoryService.reserveStock(variantId, quantity, tx)
  }

  /**
   * Reserves inventory for multiple items CONCURRENTLY instead of sequentially.
   *
   * Implementation note: We use Promise.all over individual reserveInventory
   * calls (one DB round trip per item) rather than a single UPDATE...FROM(VALUES)
   * batch query. This is because InventoryService.reserveStock contains
   * conditional logic (checking stock level before decrementing) that is not
   * trivially expressible as a single Drizzle ORM statement.
   *
   * Net effect: N items = 1 parallel "wave" of N round trips instead of
   * N sequential round trips — transaction hold time drops from O(N) to O(1)
   * round trips in terms of latency.
   *
   * If you later need a true single-query batch (e.g. for very large carts or
   * stricter DB connection pool limits), the approach would be a raw SQL:
   *   UPDATE inventory SET stock = inventory.stock - v.qty
   *   FROM (VALUES ($1::uuid,$2::int), ...) AS v(variant_id, qty)
   *   WHERE inventory.variant_id = v.variant_id AND inventory.stock >= v.qty
   *   RETURNING inventory.variant_id
   * and then compare returned variant IDs to the input set to find failures.
   */
  static async reserveInventoryBatch(
    tx: any,
    items: { variantId: string; quantity: number }[]
  ): Promise<{ variantId: string; success: boolean }[]> {
    return Promise.all(
      items.map(async (item) => ({
        variantId: item.variantId,
        success: await CheckoutRepository.reserveInventory(tx, item.variantId, item.quantity),
      }))
    )
  }

  /**
   * Increments the usage count of a coupon.
   */
  static async incrementCouponUses(tx: any, couponId: string) {
    await tx
      .update(coupons)
      .set({ currentUses: sql`${coupons.currentUses} + 1` })
      .where(eq(coupons.id, couponId))
  }

  /**
   * Clears the cart items for a given cart ID.
   */
  static async clearCartItems(tx: any, cartId: string) {
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId))
  }

  /**
   * Saves a user address within the current transaction context.
   */
  static async saveAddress(tx: any, userId: string, data: any) {
    // Deactivate previous default
    await tx
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId))

    // Insert new default
    await tx.insert(addresses).values({
      userId,
      ...data,
      isDefault: true,
    })
  }
}
