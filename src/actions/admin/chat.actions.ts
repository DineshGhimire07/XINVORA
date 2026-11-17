"use server"

import { revalidatePath } from "next/cache"
import { ChatInquiryService } from "@/services/chat-inquiry.service"
import { SessionService } from "@/services/session.service"

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
