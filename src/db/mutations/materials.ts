import "server-only"
import { eq } from "drizzle-orm"
import { materials } from "../schema"

export async function insertMaterial(data: Partial<typeof materials.$inferInsert>, tx: any) {
  const result = await tx.insert(materials).values(data).returning()
  return result[0]
}

export async function updateMaterial(id: string, data: Partial<typeof materials.$inferInsert>, tx: any) {
  const result = await tx
    .update(materials)
    .set({ ...data })
    .where(eq(materials.id, id))
    .returning()
  return result[0]
}

export async function softDeleteMaterial(id: string, tx: any) {
  const result = await tx
    .update(materials)
    .set({ deletedAt: new Date() })
    .where(eq(materials.id, id))
    .returning()
  return result[0]
}

export async function restoreMaterial(id: string, tx: any) {
  const result = await tx
    .update(materials)
    .set({ deletedAt: null })
    .where(eq(materials.id, id))
    .returning()
  return result[0]
}
