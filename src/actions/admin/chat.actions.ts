"use server"

import { revalidatePath } from "next/cache"
import { ChatInquiryService } from "@/services/chat-inquiry.service"
import { SessionService } from "@/services/session.service"

export async function sendAdminReplyAction({
  inquiryId,
  message,
}: {
  inquiryId: string
  message: string
}) {
  await SessionService.requireAdmin()
  if (!message.trim()) {
    return { success: false, error: "Reply message cannot be empty." }
  }

  const newMsg = await ChatInquiryService.addMessage({
    inquiryId,
    sender: "ADMIN",
    message: message.trim(),
  })

  revalidatePath("/admin/inbox")
  return { success: true, message: newMsg }
}

export async function getInquiryMessagesAction(inquiryId: string) {
  await SessionService.requireAdmin()
  const messages = await ChatInquiryService.getMessages(inquiryId)
  return { success: true, messages }
}

export async function markChatReadAction(id: string) {
  await SessionService.requireAdmin()
  await ChatInquiryService.markRead(id)
  revalidatePath("/admin/inbox")
}

export async function markChatRepliedAction(id: string) {
  await SessionService.requireAdmin()
  await ChatInquiryService.markReplied(id)
  revalidatePath("/admin/inbox")
}

export async function deleteChatAction(id: string) {
  await SessionService.requireAdmin()
  await ChatInquiryService.deleteById(id)
  revalidatePath("/admin/inbox")
}
