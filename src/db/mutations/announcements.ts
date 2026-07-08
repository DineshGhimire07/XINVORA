import { eq } from "drizzle-orm"
import { db } from "../client"
import { announcements } from "../schema/cms"

export async function insertAnnouncement(data: any, tx: any = db) {
  const [announcement] = await tx.insert(announcements).values(data).returning()
  return announcement
}

export async function updateAnnouncement(id: string, data: any, tx: any = db) {
  const [announcement] = await tx
    .update(announcements)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(announcements.id, id))
    .returning()
  return announcement
}

export async function softDeleteAnnouncement(id: string, tx: any = db) {
  const [announcement] = await tx
    .update(announcements)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(announcements.id, id))
    .returning()
  return announcement
}
