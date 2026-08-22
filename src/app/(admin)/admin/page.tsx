import { SessionService } from "@/services/session.service"
import { DashboardClient } from "./DashboardClient"
import {
  getDashboardStats,
  getSalesOverviewChart,
  getRecentOrders,
  getTopProducts,
  getOrdersByStatus,
  getLowStockAlert,
} from "@/db/queries/dashboard"

export const metadata = {
  title: "Admin Dashboard | XINVORA",
}

export default async function AdminDashboardPage() {
  const session = await SessionService.requireAdmin()

  const displayName = session.firstName
    ? `${session.firstName} ${session.lastName || ""}`.trim()
    : session.email || "Admin User"

  const [
    stats,
    salesChartData,
    recentOrders,
    topProducts,
    ordersByStatus,
    lowStockItems,
  ] = await Promise.all([
    getDashboardStats().catch(() => ({
      revenue: { value: 0, change: "0%", isPositive: true },
      orders: { value: 0, change: "0%", isPositive: true },
      customers: { value: 0, change: "0%", isPositive: true },
      aov: { value: 0, change: "0%", isPositive: true },
    })),
    getSalesOverviewChart().catch(() => []),
    getRecentOrders().catch(() => []),
    getTopProducts().catch(() => []),
    getOrdersByStatus().catch(() => []),
    getLowStockAlert().catch(() => []),
  ])

  return (
    <DashboardClient
      userName={displayName}
      stats={stats}
      salesChartData={salesChartData}
      recentOrders={recentOrders}
      topProducts={topProducts}
      ordersByStatus={ordersByStatus}
      lowStockItems={lowStockItems}
    />
  )
}
