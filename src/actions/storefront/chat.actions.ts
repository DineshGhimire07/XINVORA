"use server"

import { db } from "@/db"
import { chatInquiries } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const submitSchema = z.object({
  message: z.string().min(2, "Message too short").max(2000),
  customerName: z.string().max(255).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  productId: z.string().optional(),
  productName: z.string().optional(),
  productUrl: z.string().optional(),
  sessionId: z.string().optional(),
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

    await db.insert(chatInquiries).values({
      message,
      customerName: customerName ? customerName.trim() : null,
      customerEmail: customerEmail ? customerEmail.trim() : null,
      productId: validProductId,
      productName: productName ? productName.trim() : null,
      productUrl: productUrl ? productUrl.trim() : null,
      sessionId: sessionId ? sessionId.trim() : null,
      status: "NEW",
    })

    revalidatePath("/admin/inbox")

    return { success: true }
  } catch (err) {
    console.error("[chat] submitChatInquiryAction error:", err)
    return { success: false, error: "Failed to send message. Try WhatsApp for instant support." }
  }
}
