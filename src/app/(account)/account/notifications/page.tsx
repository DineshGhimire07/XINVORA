import { SessionService } from "@/services/session.service"
import { NotificationService } from "@/services/notification.service"
import { Stack } from "@/components/shared/stack"
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
      <div className="border-b border-border-primary/20 pb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</span>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">Notification Center</h1>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}
