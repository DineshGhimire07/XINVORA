import { db } from "@/db"
import { chatInquiries } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"

export class ChatInquiryService {
  static async getAll(limit = 100) {
    return db
      .select()
      .from(chatInquiries)
      .orderBy(desc(chatInquiries.createdAt))
      .limit(limit)
  }

  static async getUnreadCount(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatInquiries)
      .where(eq(chatInquiries.status, "NEW"))
    return Number(row?.count ?? 0)
  }

  static async markRead(id: string) {
    await db
      .update(chatInquiries)
      .set({ status: "READ", updatedAt: new Date() })
      .where(eq(chatInquiries.id, id))
  }

  static async markReplied(id: string) {
    await db
      .update(chatInquiries)
      .set({ status: "REPLIED", updatedAt: new Date() })
      .where(eq(chatInquiries.id, id))
  }

  static async deleteById(id: string) {
    await db.delete(chatInquiries).where(eq(chatInquiries.id, id))
  }
}
