import "server-only"
import { eq } from "drizzle-orm"
import { collections } from "../schema"

export async function insertCollection(data: Partial<typeof collections.$inferInsert>, tx: any) {
  const result = await tx.insert(collections).values(data).returning()
  return result[0]
}

export async function updateCollection(id: string, data: Partial<typeof collections.$inferInsert>, tx: any) {
  const result = await tx
    .update(collections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning()
  return result[0]
}

export async function softDeleteCollection(id: string, tx: any) {
  const result = await tx
    .update(collections)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning()
  return result[0]
}

export async function restoreCollection(id: string, tx: any) {
  const result = await tx
    .update(collections)
    .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning()
  return result[0]
}
