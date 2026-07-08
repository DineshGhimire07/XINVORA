import "server-only"
import { eq } from "drizzle-orm"
import { variants } from "../schema"

export async function insertVariant(data: Partial<typeof variants.$inferInsert>, tx: any) {
  const result = await tx.insert(variants).values(data).returning()
  return result[0]
}

export async function updateVariant(id: string, data: Partial<typeof variants.$inferInsert>, tx: any) {
  const result = await tx
    .update(variants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(variants.id, id))
    .returning()
  return result[0]
}

export async function deleteVariant(id: string, tx: any) {
  const result = await tx
    .update(variants)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(variants.id, id))
    .returning()
  return result[0]
}
