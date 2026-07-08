import { eq } from "drizzle-orm"
import { db } from "../client"
import { orders } from "../schema/orders"

export class OrderRepository {
  static async updateOrderStatus(tx: any, orderId: string, status: any, extraData: any = {}) {
    const client = tx || db
    await client
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
        ...extraData,
      })
      .where(eq(orders.id, orderId))
  }
}
