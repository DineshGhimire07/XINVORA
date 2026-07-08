import { eq, and, inArray } from "drizzle-orm"
import { db } from "../client"
import { addresses, coupons, inventory } from "../schema"

export async function getUserAddresses(userId: string) {
  return await db.select().from(addresses).where(eq(addresses.userId, userId))
}

export async function getCouponByCode(code: string) {
  const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1)
  return result.length > 0 ? result[0] : null
}

export async function verifyInventoryLevels(variantIds: string[]) {
  if (variantIds.length === 0) return []
  return await db.select().from(inventory).where(inArray(inventory.variantId, variantIds))
}
