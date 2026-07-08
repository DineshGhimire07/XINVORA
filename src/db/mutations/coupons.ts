import "server-only"
import { eq } from "drizzle-orm"
import { coupons } from "../schema"

export async function insertCoupon(data: Partial<typeof coupons.$inferInsert>, tx: any) {
  const result = await tx.insert(coupons).values(data).returning()
  return result[0]
}

export async function updateCoupon(id: string, data: Partial<typeof coupons.$inferInsert>, tx: any) {
  const result = await tx
    .update(coupons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning()
  return result[0]
}

export async function softDeleteCoupon(id: string, tx: any) {
  const result = await tx
    .update(coupons)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning()
  return result[0]
}

export async function restoreCoupon(id: string, tx: any) {
  const result = await tx
    .update(coupons)
    .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning()
  return result[0]
}
