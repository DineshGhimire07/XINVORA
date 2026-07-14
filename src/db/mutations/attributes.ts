import "server-only"
import { eq } from "drizzle-orm"
import { attributes, attributeValues } from "../schema"

export async function insertAttribute(data: Partial<typeof attributes.$inferInsert>, tx: any) {
  const result = await tx.insert(attributes).values(data).returning()
  return result[0]
}

export async function updateAttribute(id: string, data: Partial<typeof attributes.$inferInsert>, tx: any) {
  const result = await tx
    .update(attributes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(attributes.id, id))
    .returning()
  return result[0]
}

export async function deleteAttribute(id: string, tx: any) {
  const result = await tx
    .delete(attributes)
    .where(eq(attributes.id, id))
    .returning()
  return result[0]
}

export async function insertAttributeValue(data: Partial<typeof attributeValues.$inferInsert>, tx: any) {
  const result = await tx.insert(attributeValues).values(data).returning()
  return result[0]
}

export async function deleteAttributeValue(id: string, tx: any) {
  const result = await tx
    .delete(attributeValues)
    .where(eq(attributeValues.id, id))
    .returning()
  return result[0]
}

export async function clearAttributeValues(attributeId: string, tx: any) {
  return await tx
    .delete(attributeValues)
    .where(eq(attributeValues.attributeId, attributeId))
}
