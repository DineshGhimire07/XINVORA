import { Metadata } from "next"
import { SessionService } from "@/services/session.service"
import { ChatInquiryService } from "@/services/chat-inquiry.service"
import { InboxClient } from "./InboxClient"

export const metadata: Metadata = {
  title: "Chat Inbox | Admin Dashboard",
}

export const dynamic = "force-dynamic"

export default async function AdminInboxPage() {
  await SessionService.requireAdmin()

  const inquiries = await ChatInquiryService.getAll(100)
  const unreadCount = await ChatInquiryService.getUnreadCount()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm font-display uppercase tracking-wider text-text-primary">
              Live Chat & Inquiries
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            Real-time messages sent by customers from the storefront chat widget with viewing context.
          </p>
        </div>
      </div>

      <InboxClient initialInquiries={inquiries} />
    </div>
  )
}
