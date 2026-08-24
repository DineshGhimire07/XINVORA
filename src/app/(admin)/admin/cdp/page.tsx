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
  // Phase 5 analytics tab queries
  getRevenueSummary,
  getRevenueByDay,
  getSessionSummary,
  getProductSalesTable,
  getCollectionRevenue,
  getUTMAttribution,
  getGeoBreakdown,
  getInventoryWithDemand,
  getTopSearchQueries,
  getCustomerValueDistribution,
} from "@/db/queries/dashboard"

export const metadata = {
  title: "Analytics | XINVORA",
}

/**
 * Build ISO date strings for the default 30-day window.
 * Always computed at request time — do NOT move to module scope (avoids stale dates).
 */
function getDefaultDateRange() {
  const end = new Date()
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  }
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error("CDP Analytics Query error:", err)
    return fallback
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ start?: string; end?: string }>
}) {
  await SessionService.requireAdmin()

  const params = await searchParams
  const defaults = getDefaultDateRange()
  const startISO = params?.start ?? defaults.startISO
  const endISO = params?.end ?? defaults.endISO

  // All queries run in parallel with safe fallbacks — one query failure will never crash the dashboard
  const [
    // Existing overview widgets (fixed 7-day window, cached separately)
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
    // Phase 5 — date-range analytics tab data
    revenueSummary,
    revenueByDay,
    sessionSummary,
    productSales,
    collectionRevenue,
    utmAttribution,
    geoBreakdown,
    inventoryWithDemand,
    topSearchQueries,
    customerDistribution,
  ] = await Promise.all([
    safeQuery(() => getDashboardStats(), {
      revenue: { value: 0, change: "0%", isPositive: true },
      orders: { value: 0, change: "0%", isPositive: true },
      customers: { value: 0, change: "0%", isPositive: true },
      aov: { value: 0, change: "0%", isPositive: true },
    }),
    safeQuery(() => getSalesOverviewChart(), []),
    safeQuery(() => getTopProducts(), []),
    safeQuery(() => getConversionRate(), { value: 0, change: "0%", isPositive: true }),
    safeQuery(() => getSessionsByDevice(), { data: [], total: 0 }),
    safeQuery(() => getRevenueByCategory(), []),
    safeQuery(() => getNewVsReturningCustomers(), {
      newCustomers: 0,
      returningCustomers: 0,
      total: 0,
      newPercentage: 0,
      returningPercentage: 0,
    }),
    safeQuery(() => getSalesHeatmap(), Array.from({ length: 7 }, () => Array(24).fill(0))),
    safeQuery(() => getTopReferrers(), []),
    safeQuery(() => getConversionFunnel(), []),
    safeQuery(() => getRevenueSummary(startISO, endISO), {
      gross: 0,
      net: 0,
      orderCount: 0,
      aov: 0,
      prevGross: 0,
      prevOrderCount: 0,
      grossChange: "0%",
      orderCountChange: "0%",
    }),
    safeQuery(() => getRevenueByDay(startISO, endISO), []),
    safeQuery(() => getSessionSummary(startISO, endISO), {
      sessions: 0,
      anonVisitors: 0,
      customers: 0,
      returning: 0,
      newVisitors: 0,
    }),
    safeQuery(() => getProductSalesTable(startISO, endISO), []),
    safeQuery(() => getCollectionRevenue(startISO, endISO), []),
    safeQuery(() => getUTMAttribution(startISO, endISO), []),
    safeQuery(() => getGeoBreakdown(startISO, endISO), []),
    safeQuery(() => getInventoryWithDemand(), []),
    safeQuery(() => getTopSearchQueries(startISO, endISO), []),
    safeQuery(() => getCustomerValueDistribution(), {
      totalCustomers: 0,
      avgLtv: 0,
      avgOrders: 0,
      avgAov: 0,
      repeatCustomers: 0,
      repeatRate: 0,
    }),
  ])

  return (
    <AnalyticsClient
      // Existing props
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
      // Phase 5 analytics tab props
      dateRange={{ startISO, endISO }}
      revenueSummary={revenueSummary}
      revenueByDay={revenueByDay}
      sessionSummary={sessionSummary}
      productSales={productSales}
      collectionRevenue={collectionRevenue}
      utmAttribution={utmAttribution}
      geoBreakdown={geoBreakdown}
      inventoryWithDemand={inventoryWithDemand}
      topSearchQueries={topSearchQueries}
      customerDistribution={customerDistribution}
    />
  )
}
