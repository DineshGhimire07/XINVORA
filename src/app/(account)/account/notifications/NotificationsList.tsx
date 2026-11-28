"use client"

import { useState } from "react"
import { markReadAction, markAllReadAction, deleteNotificationAction } from "@/actions/notification.actions"
import { Bell, CheckCheck, Trash2, CheckCircle2 } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

interface NotificationsListProps {
  initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)

  const handleMarkRead = async (id: string) => {
    const result = await markReadAction(id)
    if (result.success) {
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    }
  }

  const handleMarkAllRead = async () => {
    setLoading(true)
    const result = await markAllReadAction()
    if (result.success) {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteNotificationAction(id)
    if (result.success) {
      setNotifications(notifications.filter((n) => n.id !== id))
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="space-y-4">
      {notifications.length > 0 && hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="text-xs uppercase tracking-wider font-semibold text-[#B89563] hover:text-[#1A110F] transition-colors inline-flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#EDE3DB] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] mb-3">
            <Bell className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#1A110F]">No notifications</p>
          <p className="text-xs text-[#8C7A72] mt-1">
            Your notification center is clear. Order status updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? "border-[#EDE3DB] opacity-80"
                  : "border-[#B89563]/60 bg-[#FAF6F2]/30"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#B89563] shrink-0" />
                  )}
                  <h3 className="text-xs sm:text-sm font-semibold text-[#1A110F]">
                    {n.title}
                  </h3>
                </div>
                <p className="text-xs text-[#73645D] leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[10px] text-[#8C7A72] block pt-1 font-mono">
                  {new Date(n.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg text-[#8C7A72] hover:text-[#1A110F] hover:bg-[#FAF6F2] transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg text-[#8C7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
