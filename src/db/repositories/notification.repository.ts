import { eq, and, desc } from "drizzle-orm"
import { db } from "../client"
import { notifications } from "../schema"

export class NotificationRepository {
  static async createNotification(tx: any, data: { userId: string; title: string; message: string; type?: string }) {
    const client = tx || db
    const [notif] = await client
      .insert(notifications)
      .values(data)
      .returning()
    return notif
  }

  static async getNotifications(tx: any, userId: string) {
    const client = tx || db
    return await client
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
  }

  static async markAsRead(tx: any, id: string, userId: string) {
    const client = tx || db
    await client
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      )
  }

  static async markAllAsRead(tx: any, userId: string) {
    const client = tx || db
    await client
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
  }

  static async deleteNotification(tx: any, id: string, userId: string) {
    const client = tx || db
    await client
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      )
  }
}
