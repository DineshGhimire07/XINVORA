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

  // All queries run in parallel — analytics must not serially block the page.
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
    getRevenueSummary(startISO, endISO),
    getRevenueByDay(startISO, endISO),
    getSessionSummary(startISO, endISO),
    getProductSalesTable(startISO, endISO),
    getCollectionRevenue(startISO, endISO),
    getUTMAttribution(startISO, endISO),
    getGeoBreakdown(startISO, endISO),
    getInventoryWithDemand(),
    getTopSearchQueries(startISO, endISO),
    getCustomerValueDistribution(),
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
