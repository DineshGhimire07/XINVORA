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
