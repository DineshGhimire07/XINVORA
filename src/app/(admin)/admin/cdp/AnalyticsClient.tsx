"use client"

import { Stack } from "@/components/shared/stack"
import { Grid } from "@/components/shared/grid"
import { StatCard } from "@/components/admin/ui/StatCard"
import { DonutChart } from "@/components/admin/ui/charts/DonutChart"
import { LineChart } from "@/components/admin/ui/charts/LineChart"
import { HeatmapChart } from "@/components/admin/ui/charts/HeatmapChart"
import { formatCurrency } from "@/lib/utils"
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Target,
} from "lucide-react"

interface AnalyticsClientProps {
  stats: {
    revenue: { value: number; change: string; isPositive: boolean }
    orders: { value: number; change: string; isPositive: boolean }
    customers: { value: number; change: string; isPositive: boolean }
    aov: { value: number; change: string; isPositive: boolean }
  }
  salesChartData: { name: string; thisWeek: number; lastWeek: number }[]
  topProducts: {
    name: string
    slug: string | null
    unitsSold: number
    revenue: number
  }[]
  conversionRate: { value: number; change: string; isPositive: boolean }
  sessionsByDevice: {
    data: { label: string; value: number; percentage: number }[]
    total: number
  }
  revenueByCategory: {
    name: string
    revenue: number
    percentage: number
  }[]
  newVsReturning: {
    newCustomers: number
    returningCustomers: number
    total: number
    newPercentage: number
    returningPercentage: number
  }
  salesHeatmap: number[][]
  topReferrers: {
    source: string
    sessions: number
    orders: number
    conversionRate: number
  }[]
  conversionFunnel: {
    name: string
    value: number
    percentage: number
  }[]
  // Phase 5 — date-range analytics tab data
  dateRange: { startISO: string; endISO: string }
  revenueSummary: {
    gross: number; net: number; orderCount: number; aov: number
    grossChange: string; orderCountChange: string
  }
  revenueByDay: { day: string; gross: number; net: number; orderCount: number; aov: number }[]
  sessionSummary: { sessions: number; anonVisitors: number; customers: number; returning: number; newVisitors: number }
  productSales: { productId: string; productName: string; productSlug: string; unitsSold: number; revenue: number; orderCount: number }[]
  collectionRevenue: { collectionId: string; collectionName: string; collectionSlug: string; revenue: number; unitsSold: number; orderCount: number }[]
  utmAttribution: { source: string; medium: string; sessions: number }[]
  geoBreakdown: { country: string; sessions: number }[]
  inventoryWithDemand: { productId: string; productName: string; sku: string; variantId: string; quantity: number; reserved: number; status: string; pendingDemand: number }[]
  topSearchQueries: { query: string; searches: number; zeroResults: number }[]
  customerDistribution: { totalCustomers: number; avgLtv: number; avgOrders: number; avgAov: number; repeatCustomers: number; repeatRate: number }
}

export function AnalyticsClient({
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
  // Phase 5
  dateRange,
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
}: AnalyticsClientProps) {
  return (
    <Stack gap={6}>
      {/* Header */}
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Analytics
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Track your store&apos;s performance and growth.
        </p>
      </div>

      {/* 1. Stat cards row */}
      <Grid cols={{ base: 1, sm: 2, lg: 5 }} gap={4}>
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.revenue.value)}
          icon={DollarSign}
          accent="purple"
          trend={{ value: stats.revenue.change, direction: stats.revenue.isPositive ? "up" : "down" }}
        />
        <StatCard
          label="Orders"
          value={stats.orders.value}
          icon={ShoppingBag}
          accent="orange"
          trend={{ value: stats.orders.change, direction: stats.orders.isPositive ? "up" : "down" }}
        />
        <StatCard
          label="Customers"
          value={stats.customers.value}
          icon={Users}
          accent="blue"
          trend={{ value: stats.customers.change, direction: stats.customers.isPositive ? "up" : "down" }}
        />
        <StatCard
          label="Avg. Order Value"
          value={formatCurrency(stats.aov.value)}
          icon={TrendingUp}
          accent="green"
          trend={{ value: stats.aov.change, direction: stats.aov.isPositive ? "up" : "down" }}
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate.value.toFixed(2)}%`}
          icon={Target}
          accent="pink"
          trend={{ value: conversionRate.change, direction: conversionRate.isPositive ? "up" : "down" }}
        />
      </Grid>

      {/* 2. Revenue Overview + Sessions by Device */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* Revenue Overview — 3 cols */}
        <div className="xl:col-span-3 bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Revenue Overview</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">Last 7 Days</span>
          </div>
          <LineChart
            data={salesChartData}
            xAxisKey="name"
            series={[
              { key: "thisWeek", name: "This Period" },
              { key: "lastWeek", name: "Previous Period" },
            ]}
          />
        </div>

        {/* Sessions by Device — 2 cols */}
        <div className="xl:col-span-2 bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Sessions by Device</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          {sessionsByDevice.data.length > 0 ? (
            <>
              <DonutChart
                data={sessionsByDevice.data}
                height={180}
              />
              <div className="mt-4 space-y-2">
                {sessionsByDevice.data.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-admin-xs">
                    <span className="text-admin-text-secondary font-medium">
                      {d.label}
                    </span>
                    <span className="text-admin-text-primary font-bold">
                      {d.percentage}%
                    </span>
                  </div>
                ))}
                <div className="border-t border-admin-border pt-2 flex items-center justify-between text-admin-xs">
                  <span className="text-admin-text-secondary font-medium">Total Sessions</span>
                  <span className="text-admin-text-primary font-bold">{sessionsByDevice.total.toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-admin-sm text-admin-text-secondary py-12 text-center">No session data yet.</p>
          )}
        </div>
      </div>

      {/* 3. Top Products + Revenue by Category + Customer New vs Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Top Products */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Top Products</h3>
          </div>
          <div className="divide-y divide-admin-border">
            {/* Header row */}
            <div className="pb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-admin-text-secondary font-bold">
              <span>Product</span>
              <div className="flex gap-8">
                <span className="w-10 text-right">Sold</span>
                <span className="w-24 text-right">Revenue</span>
              </div>
            </div>
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
                  <span className="text-admin-sm font-semibold text-admin-text-primary truncate max-w-[55%]">
                    {product.name}
                  </span>
                  <div className="flex gap-8 shrink-0">
                    <span className="text-admin-xs text-admin-text-secondary w-10 text-right">
                      {product.unitsSold}
                    </span>
                    <span className="text-admin-sm font-bold text-admin-text-primary w-24 text-right">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-admin-sm text-admin-text-secondary py-4 text-center">No product sales yet.</p>
            )}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Revenue by Category</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          {revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {revenueByCategory.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-admin-xs">
                    <span className="text-admin-text-secondary font-medium">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-admin-text-secondary">{cat.percentage}%</span>
                      <span className="text-admin-text-primary font-bold w-24 text-right">
                        {formatCurrency(cat.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-admin-content h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: "var(--admin-chart-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-admin-sm text-admin-text-secondary py-12 text-center">No category revenue data yet.</p>
          )}
        </div>

        {/* Customer New vs Returning */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Customer New vs Returning</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          {newVsReturning.total > 0 ? (
            <>
              <DonutChart
                data={[
                  { label: "New Customers", value: newVsReturning.newCustomers },
                  { label: "Returning Customers", value: newVsReturning.returningCustomers },
                ]}
                height={180}
              />
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-admin-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--admin-chart-primary)" }} />
                    <span className="text-admin-text-secondary font-medium">New Customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-admin-text-secondary">{newVsReturning.newPercentage}%</span>
                    <span className="text-admin-text-primary font-bold">{newVsReturning.newCustomers}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-admin-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--admin-chart-secondary)" }} />
                    <span className="text-admin-text-secondary font-medium">Returning Customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-admin-text-secondary">{newVsReturning.returningPercentage}%</span>
                    <span className="text-admin-text-primary font-bold">{newVsReturning.returningCustomers}</span>
                  </div>
                </div>
                <div className="border-t border-admin-border pt-2 flex items-center justify-between text-admin-xs">
                  <span className="text-admin-text-secondary font-medium">Total Customers</span>
                  <span className="text-admin-text-primary font-bold">{newVsReturning.total}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-admin-sm text-admin-text-secondary py-12 text-center">No customer data yet.</p>
          )}
        </div>
      </div>

      {/* 4. Sales Heatmap + Top Referrers + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sales Heatmap */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Sales Heatmap</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          <HeatmapChart data={salesHeatmap} height={200} />
        </div>

        {/* Top Referrers */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Top Referrers</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          <div className="divide-y divide-admin-border">
            {/* Header */}
            <div className="pb-2 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-wider text-admin-text-secondary font-bold">
              <span>Source</span>
              <span className="text-right">Sessions</span>
              <span className="text-right">Orders</span>
              <span className="text-right">Conv. Rate</span>
            </div>
            {topReferrers.length > 0 ? (
              topReferrers.map((ref, idx) => (
                <div key={idx} className="py-2.5 grid grid-cols-4 gap-2 items-center text-admin-xs">
                  <span className="text-admin-text-primary font-medium truncate">{ref.source}</span>
                  <span className="text-admin-text-secondary text-right">{ref.sessions.toLocaleString()}</span>
                  <span className="text-admin-text-secondary text-right">{ref.orders.toLocaleString()}</span>
                  <span className="text-admin-text-primary font-bold text-right">{ref.conversionRate}%</span>
                </div>
              ))
            ) : (
              <p className="text-admin-sm text-admin-text-secondary py-4 text-center col-span-4">No referrer data yet.</p>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Conversion Funnel</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">This Week</span>
          </div>
          {conversionFunnel.length > 0 && conversionFunnel[0].value > 0 ? (
            <div className="space-y-3">
              {conversionFunnel.map((stage, idx) => {
                const FUNNEL_COLORS = [
                  "var(--admin-chart-primary)",
                  "var(--admin-chart-secondary)",
                  "var(--admin-chart-compare)",
                  "#8b5cf6",
                  "#ec4899",
                ]
                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex items-center justify-between text-admin-xs">
                      <span className="text-admin-text-secondary font-medium">{stage.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-admin-text-primary font-bold">{stage.value.toLocaleString()}</span>
                        <span className="text-admin-text-secondary text-[10px]">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-admin-content h-5 rounded-admin-sm overflow-hidden relative">
                      <div
                        className="h-full rounded-admin-sm transition-all duration-700 ease-out"
                        style={{
                          width: `${stage.percentage}%`,
                          backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length],
                          minWidth: stage.value > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                </div>
                )
              })}
            </div>
          ) : (
            <p className="text-admin-sm text-admin-text-secondary py-12 text-center">No funnel data yet.</p>
          )}
        </div>
      </div>

      {/* ── PHASE 5: DATE-RANGE ANALYTICS SECTIONS ───────────────────────── */}

      {/* Revenue Summary */}
      <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
        <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-1">Revenue Summary</h2>
        <p className="text-admin-xs text-admin-text-secondary mb-4">
          {dateRange.startISO.slice(0,10)} → {dateRange.endISO.slice(0,10)} · Source of truth: orders table
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { label: "Gross Revenue", value: `NPR ${revenueSummary.gross.toLocaleString()}`, sub: revenueSummary.grossChange + " vs prev period" },
            { label: "Net Revenue", value: `NPR ${revenueSummary.net.toLocaleString()}`, sub: "" },
            { label: "Orders", value: revenueSummary.orderCount.toLocaleString(), sub: revenueSummary.orderCountChange + " vs prev period" },
            { label: "AOV", value: `NPR ${revenueSummary.aov.toFixed(0)}`, sub: "" },
          ] as {label:string;value:string;sub:string}[]).map((item) => (
            <div key={item.label} className="p-4 rounded-md bg-admin-background border border-admin-border">
              <p className="text-admin-xs text-admin-text-secondary uppercase tracking-wider">{item.label}</p>
              <p className="text-admin-2xl font-bold text-admin-text-primary mt-1">{item.value}</p>
              {item.sub && <p className="text-admin-xs text-admin-text-secondary mt-1">{item.sub}</p>}
            </div>
          ))}
        </div>
        {revenueByDay.length > 0 && (
          <div className="mt-6 space-y-1.5">
            <p className="text-admin-xs text-admin-text-secondary uppercase tracking-wider mb-2">Daily Revenue (last 14 days)</p>
            {(() => {
              const maxGross = revenueByDay.reduce((m, r) => Math.max(m, r.gross), 1)
              return revenueByDay.slice(-14).map((d) => (
                <div key={d.day} className="flex items-center gap-3 text-admin-xs">
                  <span className="text-admin-text-secondary w-24 shrink-0">{d.day}</span>
                  <div className="flex-1 bg-admin-background rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, (d.gross / maxGross) * 100)}%` }} />
                  </div>
                  <span className="text-admin-text-primary w-28 text-right font-medium">NPR {d.gross.toLocaleString()}</span>
                  <span className="text-admin-text-secondary w-14 text-right">{d.orderCount} ord</span>
                </div>
              ))
            })()}
          </div>
        )}
      </div>

      {/* Visitors & Sessions */}
      <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
        <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-1">Visitors & Sessions</h2>
        <p className="text-admin-xs text-admin-text-secondary mb-4">
          Anonymous visitors = COUNT DISTINCT anonymous_id (requires migration 0014).
          Authenticated customers = COUNT DISTINCT user_id.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {([
            { label: "Sessions", value: sessionSummary.sessions },
            { label: "Anon Visitors", value: sessionSummary.anonVisitors },
            { label: "Auth Customers", value: sessionSummary.customers },
            { label: "Returning", value: sessionSummary.returning },
            { label: "New Visitors", value: sessionSummary.newVisitors },
          ] as {label:string;value:number}[]).map((item) => (
            <div key={item.label} className="p-4 rounded-md bg-admin-background border border-admin-border">
              <p className="text-admin-xs text-admin-text-secondary uppercase tracking-wider">{item.label}</p>
              <p className="text-admin-xl font-bold text-admin-text-primary mt-1">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products by Sales */}
      <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
        <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-4">Top Products by Revenue</h2>
        {productSales.length === 0 ? (
          <p className="text-admin-sm text-admin-text-secondary py-8 text-center">No orders in selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-admin-sm">
              <thead>
                <tr className="border-b border-admin-border text-admin-text-secondary text-admin-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">Product</th>
                  <th className="text-right py-2 px-4">Units</th>
                  <th className="text-right py-2 px-4">Orders</th>
                  <th className="text-right py-2 pl-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {productSales.slice(0, 20).map((p) => (
                  <tr key={p.productId} className="border-b border-admin-border/50 hover:bg-admin-background/40 transition-colors">
                    <td className="py-2 pr-4">
                      <a href={`/products/${p.productSlug}`} target="_blank" rel="noopener noreferrer"
                        className="text-admin-text-primary hover:underline">{p.productName}</a>
                    </td>
                    <td className="text-right py-2 px-4 text-admin-text-secondary">{p.unitsSold}</td>
                    <td className="text-right py-2 px-4 text-admin-text-secondary">{p.orderCount}</td>
                    <td className="text-right py-2 pl-4 font-semibold">NPR {p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collection Revenue + Traffic side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
          <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-4">Collections by Revenue</h2>
          {collectionRevenue.length === 0 ? (
            <p className="text-admin-sm text-admin-text-secondary py-8 text-center">No data in period.</p>
          ) : (
            <div className="space-y-2">
              {collectionRevenue.slice(0, 10).map((c) => (
                <div key={c.collectionId} className="flex items-center gap-3 text-admin-sm py-1.5 border-b border-admin-border/50">
                  <a href={`/collections/${c.collectionSlug}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-admin-text-primary hover:underline truncate">{c.collectionName}</a>
                  <span className="text-admin-text-secondary text-admin-xs shrink-0">{c.unitsSold} u</span>
                  <span className="font-medium shrink-0">NPR {c.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
          <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-4">Traffic Sources</h2>
          {utmAttribution.length === 0 ? (
            <p className="text-admin-sm text-admin-text-secondary py-8 text-center">No session data in period.</p>
          ) : (
            <div className="space-y-2">
              {utmAttribution.slice(0, 12).map((u, i) => (
                <div key={i} className="flex items-center gap-3 text-admin-sm py-1.5 border-b border-admin-border/50">
                  <span className="flex-1 text-admin-text-primary font-medium">{u.source}</span>
                  <span className="text-admin-text-secondary text-admin-xs">{u.medium}</span>
                  <span className="text-admin-text-secondary shrink-0">{u.sessions} sessions</span>
                </div>
              ))}
            </div>
          )}
          {geoBreakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-admin-border/50">
              <p className="text-admin-xs text-admin-text-secondary uppercase tracking-wider mb-2">Top Countries</p>
              <div className="space-y-1">
                {geoBreakdown.slice(0, 5).map((g) => (
                  <div key={g.country} className="flex items-center gap-2 text-admin-xs text-admin-text-secondary">
                    <span className="flex-1">{g.country}</span>
                    <span>{g.sessions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Distribution + Search side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
          <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-4">Customer Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              { label: "Total Customers", value: customerDistribution.totalCustomers.toLocaleString() },
              { label: "Repeat Customers", value: customerDistribution.repeatCustomers.toLocaleString() },
              { label: "Repeat Rate", value: `${customerDistribution.repeatRate}%` },
              { label: "Avg LTV", value: `NPR ${customerDistribution.avgLtv.toFixed(0)}` },
              { label: "Avg Orders/Customer", value: customerDistribution.avgOrders.toFixed(1) },
              { label: "Avg AOV", value: `NPR ${customerDistribution.avgAov.toFixed(0)}` },
            ] as {label:string;value:string}[]).map((item) => (
              <div key={item.label} className="p-3 rounded-md bg-admin-background border border-admin-border">
                <p className="text-admin-xs text-admin-text-secondary">{item.label}</p>
                <p className="text-admin-lg font-bold text-admin-text-primary mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
          <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-1">Search Queries</h2>
          <p className="text-admin-xs text-admin-text-secondary mb-4">
            Requires Phase 4 SEARCH events in production. Empty until data accumulates.
          </p>
          {topSearchQueries.length === 0 ? (
            <p className="text-admin-sm text-admin-text-secondary py-8 text-center">No search data yet.</p>
          ) : (
            <table className="w-full text-admin-sm">
              <thead>
                <tr className="border-b border-admin-border text-admin-text-secondary text-admin-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">Query</th>
                  <th className="text-right py-2 px-4">Searches</th>
                  <th className="text-right py-2">Zero Results</th>
                </tr>
              </thead>
              <tbody>
                {topSearchQueries.slice(0,10).map((q) => (
                  <tr key={q.query} className="border-b border-admin-border/50">
                    <td className="py-1.5 pr-4 text-admin-text-primary">{q.query}</td>
                    <td className="text-right py-1.5 px-4">{q.searches}</td>
                    <td className={`text-right py-1.5 ${q.zeroResults > 0 ? "text-red-500 font-medium" : "text-admin-text-secondary"}`}>
                      {q.zeroResults > 0 ? q.zeroResults : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Inventory with Demand */}
      <div className="border border-admin-border rounded-lg p-6 bg-admin-surface">
        <h2 className="text-admin-lg font-semibold text-admin-text-primary mb-4">Inventory & Back-in-Stock Demand</h2>
        {inventoryWithDemand.length === 0 ? (
          <p className="text-admin-sm text-admin-text-secondary py-8 text-center">No inventory data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-admin-sm">
              <thead>
                <tr className="border-b border-admin-border text-admin-text-secondary text-admin-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">Product</th>
                  <th className="text-left py-2 px-4">SKU</th>
                  <th className="text-right py-2 px-4">Stock</th>
                  <th className="text-right py-2 px-4">Status</th>
                  <th className="text-right py-2 pl-4">BIS Demand</th>
                </tr>
              </thead>
              <tbody>
                {inventoryWithDemand.slice(0, 30).map((item) => (
                  <tr key={item.variantId} className="border-b border-admin-border/50 hover:bg-admin-background/40 transition-colors">
                    <td className="py-2 pr-4 text-admin-text-primary">{item.productName}</td>
                    <td className="py-2 px-4 text-admin-text-secondary font-mono text-admin-xs">{item.sku}</td>
                    <td className="text-right py-2 px-4">{item.quantity}</td>
                    <td className="text-right py-2 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-admin-xs font-medium ${
                        item.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" :
                        item.status === "LOW_STOCK" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>{item.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className={`text-right py-2 pl-4 font-semibold ${item.pendingDemand > 0 ? "text-violet-600" : "text-admin-text-secondary"}`}>
                      {item.pendingDemand > 0 ? item.pendingDemand : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </Stack>
  )
}
