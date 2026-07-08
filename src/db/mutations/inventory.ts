import "server-only"
import { eq } from "drizzle-orm"
import { inventory } from "../schema"

export async function insertInventory(data: Partial<typeof inventory.$inferInsert>, tx: any) {
  const result = await tx.insert(inventory).values(data).returning()
  return result[0]
}

export async function updateInventory(id: string, data: Partial<typeof inventory.$inferInsert>, tx: any) {
  const result = await tx
    .update(inventory)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inventory.id, id))
    .returning()
  return result[0]
}

export async function updateInventoryByVariant(variantId: string, data: Partial<typeof inventory.$inferInsert>, tx: any) {
  const result = await tx
    .update(inventory)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inventory.variantId, variantId))
    .returning()
  return result[0]
}
