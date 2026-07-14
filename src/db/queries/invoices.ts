import { db } from "@/db/client"
import { orders } from "@/db/schema/orders"
import { users } from "@/db/schema/users"
import { orderItems } from "@/db/schema/order-items"
import { eq, isNull, isNotNull, and, or, ilike, sql, desc, inArray } from "drizzle-orm"

interface InvoiceSearchParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}

export async function findAdminInvoicesPaginated(options: InvoiceSearchParams = {}) {
  const page = options.page || 1
  const limit = options.limit || 10
  const offset = (page - 1) * limit

  // Invoices are orders
  const conditions: any[] = [
    isNull(orders.deletedAt),
  ]

  // Status Tab filtering
  if (options.status && options.status !== "all") {
    switch (options.status) {
      case "pending":
        conditions.push(
          isNull(orders.invoicePrintedAt),
          inArray(orders.status, ["PENDING", "PENDING_PAYMENT", "PAYMENT_PENDING_VERIFICATION", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"])
        )
        break
      case "printed":
        conditions.push(
          isNotNull(orders.invoicePrintedAt),
          inArray(orders.status, ["PENDING", "PENDING_PAYMENT", "PAYMENT_PENDING_VERIFICATION", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"])
        )
        break
      case "void":
        conditions.push(inArray(orders.status, ["CANCELLED", "FAILED"]))
        break
      case "refunded":
        conditions.push(eq(orders.status, "REFUNDED"))
        break
    }
  }

  // Date Range filtering
  if (options.startDate) {
    conditions.push(sql`${orders.createdAt} >= ${options.startDate}`)
  }
  if (options.endDate) {
    conditions.push(sql`${orders.createdAt} <= ${options.endDate}`)
  }

  // Text search
  if (options.search) {
    const likeQuery = `%${options.search}%`
    conditions.push(
      or(
        ilike(orders.invoiceNumber, likeQuery),
        ilike(orders.orderNumber, likeQuery),
        ilike(users.email, likeQuery),
        ilike(sql`concat(${users.firstName}, ' ', ${users.lastName})`, likeQuery)
      )
    )
  }

  // Fetch paginated order records
  const items = await db.query.orders.findMany({
    where: and(...conditions),
    orderBy: [desc(orders.createdAt)],
    limit: limit,
    offset: offset,
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
      }
    }
  })

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(...conditions))

  const total = Number(countResult[0]?.count ?? 0)

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function getInvoiceStats(options: { startDate?: string; endDate?: string } = {}) {
  const conditions: any[] = [
    isNull(orders.deletedAt),
  ]

  if (options.startDate) {
    conditions.push(sql`${orders.createdAt} >= ${options.startDate}`)
  }
  if (options.endDate) {
    conditions.push(sql`${orders.createdAt} <= ${options.endDate}`)
  }

  const whereClause = and(...conditions)

  const [counts] = await db
    .select({
      totalInvoices: sql<number>`count(*)`,
      printedInvoices: sql<number>`count(case when ${orders.invoicePrintedAt} is not null and ${orders.status} not in ('CANCELLED', 'FAILED', 'REFUNDED') then 1 end)`,
      pendingInvoices: sql<number>`count(case when ${orders.invoicePrintedAt} is null and ${orders.status} not in ('CANCELLED', 'FAILED', 'REFUNDED') then 1 end)`,
      totalAmount: sql<number>`coalesce(sum(${orders.total}), 0)`,
      avgValue: sql<number>`coalesce(avg(${orders.total}), 0)`
    })
    .from(orders)
    .where(whereClause)

  return {
    totalInvoices: Number(counts?.totalInvoices ?? 0),
    printedInvoices: Number(counts?.printedInvoices ?? 0),
    pendingInvoices: Number(counts?.pendingInvoices ?? 0),
    totalAmount: Math.round(Number(counts?.totalAmount ?? 0) / 100), // in currency units
    avgValue: Math.round(Number(counts?.avgValue ?? 0) / 100)
  }
}
