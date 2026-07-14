import "server-only"
import { eq } from "drizzle-orm"
import { tags } from "../schema"

export async function insertTag(data: Partial<typeof tags.$inferInsert>, tx: any) {
  const result = await tx.insert(tags).values(data).returning()
  return result[0]
}

export async function updateTag(id: string, data: Partial<typeof tags.$inferInsert>, tx: any) {
  const result = await tx
    .update(tags)
    .set(data)
    .where(eq(tags.id, id))
    .returning()
  return result[0]
}

export async function deleteTag(id: string, tx: any) {
  const result = await tx
    .delete(tags)
    .where(eq(tags.id, id))
    .returning()
  return result[0]
}
