import { NotificationRepository } from "../db/repositories/notification.repository"

export class NotificationService {
  static async getNotifications(userId: string) {
    return await NotificationRepository.getNotifications(null, userId)
  }

  static async markRead(userId: string, id: string) {
    await NotificationRepository.markAsRead(null, id, userId)
  }

  static async markAllRead(userId: string) {
    await NotificationRepository.markAllAsRead(null, userId)
  }

  static async deleteNotification(userId: string, id: string) {
    await NotificationRepository.deleteNotification(null, id, userId)
  }

  static async triggerOrderNotification(userId: string, orderNumber: string, status: string) {
    let title = "Order Update"
    let message = `Your order ${orderNumber} has been updated to ${status}.`

    if (status === "PAID") {
      title = "Payment Confirmed"
      message = `Thank you! Your payment for order ${orderNumber} has been successfully processed.`
    } else if (status === "SHIPPED") {
      title = "Order Shipped"
      message = `Exciting news! Your order ${orderNumber} is on its way.`
    } else if (status === "DELIVERED") {
      title = "Order Delivered"
      message = `Your order ${orderNumber} has been marked as delivered. We hope you enjoy it!`
    }

    await NotificationRepository.createNotification(null, {
      userId,
      title,
      message,
      type: "ORDER_UPDATE",
    })
  }
}
