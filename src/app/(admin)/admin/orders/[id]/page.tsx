import { SessionService } from "@/services/session.service"
import { AdminOrdersService } from "@/services/admin/orders.service"
import { db } from "@/db/client"
import { orders } from "@/db/schema/orders"
import { userEvents } from "@/db/schema/user-events"
import { userSessions } from "@/db/schema/user-sessions"
import { notFound } from "next/navigation"
import { count, eq } from "drizzle-orm"
import { OrderDetailWorkspace } from "./OrderDetailWorkspace"

// Client-side details workstation for order details

export const metadata = {
  title: "Order Details | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  const order = await AdminOrdersService.getOrderDetails(id)
  if (!order) {
    notFound()
  }

  // Fetch count of total orders placed by this customer
  const ordersCountResult = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.userId, order.userId))
  
  const totalOrders = ordersCountResult[0]?.count ?? 1

  // Fetch real session details if any exist for this order
  const sessionDetails = await db
    .select({
      ipAddress: userSessions.ipAddress,
      deviceType: userSessions.deviceType,
      browser: userSessions.browser,
      operatingSystem: userSessions.operatingSystem,
      utmSource: userSessions.utmSource,
    })
    .from(userEvents)
    .innerJoin(userSessions, eq(userEvents.sessionId, userSessions.id))
    .where(eq(userEvents.orderId, order.id))
    .limit(1)

  const sessionInfo = sessionDetails[0] || null

  return (
    <div className="space-y-6">
      <OrderDetailWorkspace 
        order={order} 
        totalOrders={totalOrders} 
        sessionInfo={sessionInfo}
      />
    </div>
  )
}
