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
    </Stack>
  )
}
