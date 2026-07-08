import "server-only"
import { eq } from "drizzle-orm"
import { orders } from "../schema"

export async function updateOrder(id: string, data: Partial<typeof orders.$inferInsert>, tx: any) {
  const result = await tx
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning()
  return result[0]
}

export async function softDeleteOrder(id: string, tx: any) {
  const result = await tx
    .update(orders)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning()
  return result[0]
}
