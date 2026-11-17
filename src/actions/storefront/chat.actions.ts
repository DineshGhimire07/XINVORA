"use server"

import { db } from "@/db"
import { chatInquiries, chatMessages } from "@/db/schema"
import { ChatInquiryService } from "@/services/chat-inquiry.service"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const submitSchema = z.object({
  message: z.string().min(1, "Message too short").max(2000),
  customerName: z.string().max(255).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  productId: z.string().optional(),
  productName: z.string().optional(),
  productUrl: z.string().optional(),
  sessionId: z.string().min(1, "Session required"),
})

export async function submitChatInquiryAction(
  data: z.infer<typeof submitSchema>
) {
  try {
    const parsed = submitSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid input." }
    }

    const { message, customerName, customerEmail, productId, productName, productUrl, sessionId } =
      parsed.data

    const validProductId =
      productId && UUID_REGEX.test(productId) ? productId : null

    // Check if an existing inquiry already exists for this session
    const existing = await ChatInquiryService.getConversationBySession(sessionId)

    let inquiryId: string

    if (existing.inquiry) {
      inquiryId = existing.inquiry.id
      // If customer updated product context or name/email, update it
      await db
        .update(chatInquiries)
        .set({
          customerName: customerName ? customerName.trim() : existing.inquiry.customerName,
          customerEmail: customerEmail ? customerEmail.trim() : existing.inquiry.customerEmail,
          productId: validProductId || existing.inquiry.productId,
          productName: productName ? productName.trim() : existing.inquiry.productName,
          productUrl: productUrl ? productUrl.trim() : existing.inquiry.productUrl,
          status: "NEW",
          updatedAt: new Date(),
        })
        .where(eq(chatInquiries.id, inquiryId))
    } else {
      const [newInquiry] = await db
        .insert(chatInquiries)
        .values({
          message: message.trim(),
          customerName: customerName ? customerName.trim() : null,
          customerEmail: customerEmail ? customerEmail.trim() : null,
          productId: validProductId,
          productName: productName ? productName.trim() : null,
          productUrl: productUrl ? productUrl.trim() : null,
          sessionId: sessionId.trim(),
          status: "NEW",
        })
        .returning({ id: chatInquiries.id })

      inquiryId = newInquiry.id
    }

    // Insert the message into chatMessages
    await ChatInquiryService.addMessage({
      inquiryId,
      sender: "CUSTOMER",
      message: message.trim(),
    })

    revalidatePath("/admin/inbox")

    const updated = await ChatInquiryService.getConversationBySession(sessionId)

    return {
      success: true,
      inquiry: updated.inquiry,
      messages: updated.messages,
    }
  } catch (err) {
    console.error("[chat] submitChatInquiryAction error:", err)
    return { success: false, error: "Failed to send message. Try WhatsApp for instant support." }
  }
}

export async function getCustomerChatHistoryAction(sessionId: string) {
  try {
    if (!sessionId) return { success: false, messages: [] }
    const conversation = await ChatInquiryService.getConversationBySession(sessionId)
    return {
      success: true,
      inquiry: conversation.inquiry,
      messages: conversation.messages,
    }
  } catch (err) {
    console.error("[chat] getCustomerChatHistoryAction error:", err)
    return { success: false, messages: [] }
  }
}
