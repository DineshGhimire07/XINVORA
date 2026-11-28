import { SessionService } from "@/services/session.service"
import { NotificationService } from "@/services/notification.service"
import { NotificationsList } from "./NotificationsList"

export const metadata = {
  title: "Notification Center | XINVORA",
  description: "View important account updates and notifications.",
}

export default async function NotificationsPage() {
  const session = await SessionService.requireAuth()
  const notifications = await NotificationService.getNotifications(session.id)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
            My Account
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
          Notification Center
        </h1>
        <p className="text-xs text-[#8C7A72] mt-1">
          Review important updates regarding your orders, shipping milestones, and account security.
        </p>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}
