import { db } from "@/db"
import { chatInquiries, chatMessages, type ChatInquiry, type ChatMessage } from "@/db/schema"
import { desc, asc, eq, sql } from "drizzle-orm"

export class ChatInquiryService {
  static async getAll(limit = 100) {
    return db
      .select()
      .from(chatInquiries)
      .orderBy(desc(chatInquiries.updatedAt), desc(chatInquiries.createdAt))
      .limit(limit)
  }

  static async getUnreadCount(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatInquiries)
      .where(eq(chatInquiries.status, "NEW"))
    return Number(row?.count ?? 0)
  }

  static async getById(id: string) {
    const [inquiry] = await db
      .select()
      .from(chatInquiries)
      .where(eq(chatInquiries.id, id))
      .limit(1)
    return inquiry || null
  }

  static async getMessages(inquiryId: string): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.inquiryId, inquiryId))
      .orderBy(asc(chatMessages.createdAt))

    // Fallback: If no explicit message rows exist yet (e.g. initial inquiry), synthesize the first message
    if (messages.length === 0) {
      const inquiry = await this.getById(inquiryId)
      if (inquiry && inquiry.message) {
        return [
          {
            id: inquiry.id,
            inquiryId: inquiry.id,
            sender: "CUSTOMER",
            message: inquiry.message,
            createdAt: inquiry.createdAt,
          },
        ]
      }
    }

    return messages
  }

  static async getConversationBySession(sessionId: string): Promise<{
    inquiry: ChatInquiry | null
    messages: ChatMessage[]
  }> {
    if (!sessionId) return { inquiry: null, messages: [] }

    const [inquiry] = await db
      .select()
      .from(chatInquiries)
      .where(eq(chatInquiries.sessionId, sessionId))
      .orderBy(desc(chatInquiries.createdAt))
      .limit(1)

    if (!inquiry) return { inquiry: null, messages: [] }

    const messages = await this.getMessages(inquiry.id)
    return { inquiry, messages }
  }

  static async addMessage({
    inquiryId,
    sender,
    message,
  }: {
    inquiryId: string
    sender: "CUSTOMER" | "ADMIN"
    message: string
  }): Promise<ChatMessage> {
    const [newMsg] = await db
      .insert(chatMessages)
      .values({
        inquiryId,
        sender,
        message,
      })
      .returning()

    // Update parent inquiry status and updatedAt
    await db
      .update(chatInquiries)
      .set({
        status: sender === "ADMIN" ? "REPLIED" : "NEW",
        updatedAt: new Date(),
      })
      .where(eq(chatInquiries.id, inquiryId))

    return newMsg
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
