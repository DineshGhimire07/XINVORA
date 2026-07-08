import "server-only"
import { eq } from "drizzle-orm"
import { categories } from "../schema"

export async function insertCategory(data: Partial<typeof categories.$inferInsert>, tx: any) {
  const result = await tx.insert(categories).values(data).returning()
  return result[0]
}

export async function updateCategory(id: string, data: Partial<typeof categories.$inferInsert>, tx: any) {
  const result = await tx
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()
  return result[0]
}

export async function softDeleteCategory(id: string, tx: any) {
  const result = await tx
    .update(categories)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()
  return result[0]
}

export async function restoreCategory(id: string, tx: any) {
  const result = await tx
    .update(categories)
    .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()
  return result[0]
}
