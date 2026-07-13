import { findOrderByNumber, findUserOrdersPaginated, findRecentOrdersWithItems } from "../db/queries/orders"

export class OrderService {
  static async getUserOrders(
    userId: string,
    options: {
      page?: number
      limit?: number
      search?: string
      status?: string
      sortBy?: "createdAt" | "total"
      sortOrder?: "asc" | "desc"
    } = {}
  ) {
    return await findUserOrdersPaginated(userId, options)
  }

  static async getRecentOrdersWithItems(userId: string, limit?: number) {
    return await findRecentOrdersWithItems(userId, limit)
  }

  static async getOrderDetail(userId: string, orderNumber: string) {
    const order = await findOrderByNumber(userId, orderNumber)
    if (!order) {
      throw new Error("Order not found or unauthorized")
    }
    return order
  }

  /**
   * Translates status into order step progression indexing.
   */
  static getTimelineSteps(status: string) {
    const steps = [
      { key: "PENDING_PAYMENT", label: "Order Created" },
      { key: "PAID", label: "Paid" },
      { key: "PROCESSING", label: "Processing" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
    ]

    const statusIndexMap: Record<string, number> = {
      PENDING_PAYMENT: 0,
      PAID: 1,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
      REFUNDED: -1,
      FAILED: -1,
    }

    const currentIndex = statusIndexMap[status] ?? 0
    return {
      steps,
      currentIndex,
      isCancelled: status === "CANCELLED",
      isFailed: status === "FAILED",
      isRefunded: status === "REFUNDED",
    }
  }
}
