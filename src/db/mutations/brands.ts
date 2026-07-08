import "server-only"
import { eq } from "drizzle-orm"
import { brands } from "../schema"

export async function insertBrand(data: Partial<typeof brands.$inferInsert>, tx: any) {
  const result = await tx.insert(brands).values(data).returning()
  return result[0]
}

export async function updateBrand(id: string, data: Partial<typeof brands.$inferInsert>, tx: any) {
  const result = await tx
    .update(brands)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning()
  return result[0]
}

export async function softDeleteBrand(id: string, tx: any) {
  const result = await tx
    .update(brands)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning()
  return result[0]
}

export async function restoreBrand(id: string, tx: any) {
  const result = await tx
    .update(brands)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning()
  return result[0]
}
