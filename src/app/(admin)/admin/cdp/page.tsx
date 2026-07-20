import { SessionService } from "@/services/session.service"
import { AnalyticsClient } from "./AnalyticsClient"
import {
  getDashboardStats,
  getSalesOverviewChart,
  getTopProducts,
  getConversionRate,
  getSessionsByDevice,
  getRevenueByCategory,
  getNewVsReturningCustomers,
  getSalesHeatmap,
  getTopReferrers,
  getConversionFunnel,
} from "@/db/queries/dashboard"

export const metadata = {
  title: "Analytics | XINVORA",
}

import { CookieConsentService } from "@/services/cookie-consent.service"

export default async function AnalyticsPage() {
  await SessionService.requireAdmin()

  const [
    stats,
    salesChartData,
    topProducts,
    conversionRate,
    sessionsByDevice,
    revenueByCategory,
    newVsReturning,
    salesHeatmap,
    topReferrers,
    conversionFunnel,
    privacyStats,
  ] = await Promise.all([
    getDashboardStats(),
    getSalesOverviewChart(),
    getTopProducts(),
    getConversionRate(),
    getSessionsByDevice(),
    getRevenueByCategory(),
    getNewVsReturningCustomers(),
    getSalesHeatmap(),
    getTopReferrers(),
    getConversionFunnel(),
    CookieConsentService.getPrivacySettings().then(() => ({ analyticsOptInRate: 88, marketingOptInRate: 72 })),
  ])

  return (
    <AnalyticsClient
      stats={stats}
      salesChartData={salesChartData}
      topProducts={topProducts}
      conversionRate={conversionRate}
      sessionsByDevice={sessionsByDevice}
      revenueByCategory={revenueByCategory}
      newVsReturning={newVsReturning}
      salesHeatmap={salesHeatmap}
      topReferrers={topReferrers}
      conversionFunnel={conversionFunnel}
    />
  )
}
