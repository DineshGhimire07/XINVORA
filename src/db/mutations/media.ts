import { eq } from "drizzle-orm"
import { db } from "../client"
import { mediaLibrary } from "../schema/media"

export async function insertMedia(data: any, tx: any = db) {
  const [media] = await tx.insert(mediaLibrary).values(data).returning()
  return media
}

export async function updateMedia(id: string, data: any, tx: any = db) {
  const [media] = await tx
    .update(mediaLibrary)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(mediaLibrary.id, id))
    .returning()
  return media
}

export async function softDeleteMedia(id: string, tx: any = db) {
  const [media] = await tx
    .delete(mediaLibrary)
    .where(eq(mediaLibrary.id, id))
    .returning()
  return media
}
