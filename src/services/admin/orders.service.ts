import "server-only"
import { eq, and, desc, ilike, or, sql, inArray, count } from "drizzle-orm"
import { db } from "@/db/client"
import { orders, orderItems, orderActivity, users, addresses, nepalProvinces, nepalDistricts, nepalMunicipalities, inventory } from "@/db/schema"
import crypto from "crypto"

export type OrderSearchParams = {
  page?: number
  limit?: number
  searchQuery?: string
  status?: string
  dateRange?: string // "today", "yesterday", "last_7_days", "last_30_days"
  paymentMethod?: string // "COD", "ONLINE"
  sort?: string // "newest", "oldest", "highest_amount", "lowest_amount", "customer_name"
}

export class AdminOrdersService {
  /**
   * Generates a cryptographically secure random identifier.
   * Excludes ambiguous characters: 0, O, I, 1, L
   */
  static generateSecureIdentifier(prefix: string, length: number = 8): string {
    const charset = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      // crypto.randomInt explicitly prevents modulo bias internally
      const randomIndex = crypto.randomInt(0, charset.length)
      result += charset[randomIndex]
    }
    return `${prefix}${result}`
  }

  static async generatePublicOrderNumber(): Promise<string> {
    let orderNumber = ""
    let isUnique = false
    while (!isUnique) {
      orderNumber = this.generateSecureIdentifier("XNV-", 8)
      const existing = await db.query.orders.findFirst({
        where: eq(orders.orderNumber, orderNumber),
      })
      if (!existing) isUnique = true
    }
    return orderNumber
  }

  static async generateInvoiceNumber(): Promise<string> {
    let invoiceNumber = ""
    let isUnique = false
    while (!isUnique) {
      invoiceNumber = this.generateSecureIdentifier("INV-", 8)
      const existing = await db.query.orders.findFirst({
        where: eq(orders.invoiceNumber, invoiceNumber),
      })
      if (!existing) isUnique = true
    }
    return invoiceNumber
  }

  /**
   * Assigns an invoice number to an order if it doesn't have one.
   */
  static async ensureInvoiceNumber(orderId: string): Promise<string> {
    return await db.transaction(async (tx) => {
      // Lock the specific order to prevent concurrent invoice generations
      const lockedOrders = await tx
        .select({ id: orders.id, invoiceNumber: orders.invoiceNumber })
        .from(orders)
        .where(eq(orders.id, orderId))
        .for("update")
      
      const order = lockedOrders[0]
      if (!order) throw new Error("Order not found")
      
      // If another request already generated the invoice while we were waiting for the lock, return it
      if (order.invoiceNumber) return order.invoiceNumber

      // Otherwise generate a new one and save it within the locked transaction
      const newInvoiceNumber = await this.generateInvoiceNumber()
      
      await tx.update(orders)
        .set({ invoiceNumber: newInvoiceNumber })
        .where(eq(orders.id, orderId))
      
      return newInvoiceNumber
    })
  }

  /**
   * Defines valid state transitions for orders.
   */
  private static VALID_TRANSITIONS: Record<string, string[]> = {
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "PAYMENT_PENDING_VERIFICATION": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["PROCESSING", "PACKED", "SHIPPED", "CANCELLED"],
    "PROCESSING": ["PACKED", "SHIPPED", "CANCELLED"],
    "PACKED": ["SHIPPED", "OUT_FOR_DELIVERY", "CANCELLED"],
    "SHIPPED": ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "RETURNED", "CANCELLED"],
    "DELIVERED": ["RETURN_REQUESTED"],
    "RETURN_REQUESTED": ["RETURNED", "DELIVERED"], // DELIVERED meaning return rejected
    "RETURNED": [],
    "CANCELLED": []
  }

  /**
   * Updates an order's status and logs the activity.
   */
  static async updateOrderStatus(orderId: string, newStatus: any, adminId: string) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })
    if (!order) throw new Error("Order not found")

    if (order.status === newStatus) return { success: true }

    // Guardrail: Validate State Transition
    const allowedTransitions = this.VALID_TRANSITIONS[order.status as string]
    if (!allowedTransitions || !allowedTransitions.includes(newStatus as string)) {
      throw new Error(`Invalid state transition: Cannot change order from ${order.status} to ${newStatus}`)
    }

    await db.transaction(async (tx) => {
      let updates: any = { status: newStatus, updatedAt: new Date() }
      
      // Auto-mark payment as PAID if manually verifying an eSewa/Khalti transfer
      if (order.status === "PAYMENT_PENDING_VERIFICATION" && newStatus === "CONFIRMED") {
        updates.paymentStatus = "PAID"
      }

      await tx.update(orders)
        .set(updates)
        .where(eq(orders.id, orderId))

      await tx.insert(orderActivity).values({
        orderId,
        action: "STATUS_UPDATE",
        oldStatus: order.status,
        newStatus,
        performedBy: adminId,
      })
    })

    return { success: true }
  }

  /**
   * Fetch paginated and filtered orders for the admin table.
   */
  static async getOrders(params: OrderSearchParams) {
    const {
      page = 1,
      limit = 20,
      searchQuery,
      status,
      dateRange,
      paymentMethod,
      sort = "newest"
    } = params

    const offset = (page - 1) * limit
    const conditions = []

    if (status && status !== "all") {
      conditions.push(eq(orders.status, status as any))
    }

    if (paymentMethod && paymentMethod !== "all") {
      if (paymentMethod === "COD") {
        conditions.push(eq(orders.paymentProvider, "CASH_ON_DELIVERY"))
      } else {
        conditions.push(eq(orders.paymentProvider, "KHALTI")) // Or whatever online provider
      }
    }

    if (searchQuery) {
      const escaped = searchQuery.replace(/[%_\\]/g, '\\$&')
      const likeQuery = `%${escaped}%`
      
      const searchConditions = [
        ilike(orders.orderNumber, likeQuery),
        ilike(orders.invoiceNumber, likeQuery),
      ]
      
      // Try parsing Internal ID
      const numericQuery = parseInt(searchQuery, 10)
      if (!isNaN(numericQuery)) {
        searchConditions.push(eq(orders.internalId, numericQuery))
      }

      // Customer info search using JSONB
      // This is a naive text search on the shippingAddress JSONB column
      searchConditions.push(sql`${orders.shippingAddress}->>'fullName' ILIKE ${likeQuery}`)
      searchConditions.push(sql`${orders.shippingAddress}->>'phone' ILIKE ${likeQuery}`)
      
      conditions.push(or(...searchConditions))
    }

    // Date range filtering
    if (dateRange && dateRange !== "all") {
      const now = new Date()
      let startDate = new Date()
      
      switch(dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          startDate.setDate(startDate.getDate() - 1)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(startDate)
          endDate.setHours(23, 59, 59, 999)
          conditions.push(sql`${orders.createdAt} <= ${endDate.toISOString()}`)
          break
        case "last_7_days":
          startDate.setDate(startDate.getDate() - 7)
          break
        case "last_30_days":
          startDate.setDate(startDate.getDate() - 30)
          break
      }
      
      if (dateRange !== "all") {
        conditions.push(sql`${orders.createdAt} >= ${startDate.toISOString()}`)
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    let orderByClause = [desc(orders.createdAt)]
    switch (sort) {
      case "oldest":
        orderByClause = [sql`${orders.createdAt} ASC`]
        break
      case "highest_amount":
        orderByClause = [desc(orders.total)]
        break
      case "lowest_amount":
        orderByClause = [sql`${orders.total} ASC`]
        break
      case "customer_name":
        orderByClause = [sql`${orders.shippingAddress}->>'fullName' ASC`]
        break
      case "newest":
      default:
        orderByClause = [desc(orders.createdAt)]
        break
    }

    const data = await db.query.orders.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
      with: {
        user: true,
      }
    })

    const countRes = await db.select({ val: count() }).from(orders).where(whereClause)
    const totalCount = countRes[0]?.val ?? 0

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    }
  }

  /**
   * Gets complete order details including items and timeline.
   */
  static async getOrderDetails(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: true,
        orderItems: {
          with: {
            variant: {
              with: {
                product: {
                  with: {
                    productImages: true
                  }
                },
                color: true,
                size: true
              }
            }
          }
        },
        orderActivity: {
          orderBy: [desc(orderActivity.createdAt)],
          with: {
            admin: true
          }
        }
      }
    })

    return order
  }

  /**
   * Retrieves dashboard summary metrics.
   */
  static async getDashboardMetrics() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const results = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= ${todayISO}::timestamp) as today_orders,
        COALESCE(SUM(total) FILTER (WHERE created_at >= ${todayISO}::timestamp), 0) as today_revenue,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'PACKED') as packed_orders,
        COUNT(*) FILTER (WHERE status = 'SHIPPED') as shipped_orders,
        COUNT(*) FILTER (WHERE status = 'OUT_FOR_DELIVERY') as out_for_delivery,
        COUNT(*) FILTER (WHERE status = 'DELIVERED') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
        COUNT(*) FILTER (WHERE payment_provider = 'CASH_ON_DELIVERY') as cod_orders,
        COUNT(*) FILTER (WHERE payment_provider != 'CASH_ON_DELIVERY') as online_orders,
        COALESCE(AVG(total), 0) as average_order_value
      FROM orders
    `)

    return (results[0] || {}) as Record<string, number | string>
  }

  static async deleteOrder(orderId: string) {
    return await db.transaction(async (tx) => {
      // 1. Fetch order items to restore inventory quantities
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId))
      
      // 2. Restore inventory quantities
      for (const item of items) {
        if (!item.variantId) continue
        await tx.update(inventory)
          .set({ quantity: sql`${inventory.quantity} + ${item.quantity}` })
          .where(eq(inventory.variantId, item.variantId))
      }
      
      // 3. Delete the order
      await tx.delete(orders).where(eq(orders.id, orderId))
    })
  }
}
