"use client"

import { useState } from "react"
import { markReadAction, markAllReadAction, deleteNotificationAction } from "@/actions/notification.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stack } from "@/components/shared/stack"

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
    <Stack gap={4}>
      {notifications.length > 0 && hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="text-[10px] uppercase tracking-widest underline hover:text-accent font-semibold"
          >
            Mark All as Read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="rounded-none border-dashed border-border-primary/60 text-center p-8 bg-surface-secondary/5">
          <p className="text-body-sm text-text-secondary">Your notification center is clear.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`rounded-none border-border-primary/30 shadow-xs transition-all duration-200 ${
                n.isRead ? "opacity-75 bg-surface" : "border-l-2 border-l-accent bg-accent/2"
              }`}
            >
              <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                    <h3 className="text-body-sm font-semibold text-text-primary">{n.title}</h3>
                  </div>
                  <p className="text-body-xs text-text-secondary leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-text-tertiary block font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[9px] uppercase tracking-wider underline hover:text-accent text-text-secondary font-medium"
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-[9px] uppercase tracking-wider underline hover:text-red-700 text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Stack>
  )
}
