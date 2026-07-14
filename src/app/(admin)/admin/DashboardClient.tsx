"use client"

import { useState } from "react"
import { Stack } from "@/components/shared/stack"
import { Grid } from "@/components/shared/grid"
import { StatCard } from "@/components/admin/ui/StatCard"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { DataTable } from "@/components/admin/ui/DataTable"
import { InspectorPanel } from "@/components/admin/ui/InspectorPanel"
import { DonutChart } from "@/components/admin/ui/charts/DonutChart"
import { LineChart } from "@/components/admin/ui/charts/LineChart"
import { formatCurrency } from "@/lib/utils"
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

interface DashboardClientProps {
  userName: string
  stats: {
    revenue: { value: number; change: string; isPositive: boolean }
    orders: { value: number; change: string; isPositive: boolean }
    customers: { value: number; change: string; isPositive: boolean }
    aov: { value: number; change: string; isPositive: boolean }
  }
  salesChartData: { name: string; thisWeek: number; lastWeek: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: Date
    customerName: string
    itemCount: number
  }[]
  topProducts: {
    name: string
    slug: string | null
    unitsSold: number
    revenue: number
  }[]
  ordersByStatus: {
    status: string
    count: number
  }[]
  lowStockItems: {
    id: string
    productName: string
    sku: string
    quantity: number
  }[]
}

export function DashboardClient({
  userName,
  stats,
  salesChartData,
  recentOrders,
  topProducts,
  ordersByStatus,
  lowStockItems,
}: DashboardClientProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<typeof recentOrders[0] | null>(null)

  // Format DataTable columns
  const orderColumns = [
    {
      accessorKey: "orderNumber",
      header: "Order ID",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        return <StatusBadge status={status} />
      },
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }: any) => `${row.getValue("itemCount")} unit${row.getValue("itemCount") === 1 ? "" : "s"}`,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => formatCurrency(row.getValue("total")),
    },
  ]

  // Transform status count for the Donut chart
  const donutData = ordersByStatus.map((item) => ({
    label: item.status.replace(/_/g, " "),
    value: Number(item.count),
  }))

  return (
    <Stack gap={6}>
      {/* Header */}
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Here is what is happening with XINVORA today.
        </p>
      </div>

      {/* 1. Stat cards */}
      <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
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
      </Grid>

      {/* 2. Middle Row: Sales chart + Recent orders table */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-3 bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Sales Overview</h3>
            <span className="text-admin-xs text-admin-text-secondary font-medium">Last 7 Days</span>
          </div>
          <LineChart
            data={salesChartData}
            xAxisKey="name"
            series={[
              { key: "thisWeek", name: "This Week" },
              { key: "lastWeek", name: "Last Week" },
            ]}
          />
        </div>

        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-admin-base font-bold text-admin-text-primary">Recent Orders</h3>
          </div>
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            onRowClick={(row) => {
              setSelectedOrder(row)
              setPanelOpen(true)
            }}
          />
        </div>
      </div>

      {/* 3. Lower Row: Top products, orders status, low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Top products */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <h3 className="text-admin-base font-bold text-admin-text-primary">Top Products</h3>
          <div className="divide-y divide-admin-border">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5 max-w-[70%]">
                    <span className="text-admin-sm font-semibold text-admin-text-primary truncate">
                      {product.name}
                    </span>
                    <span className="text-admin-xs text-admin-text-secondary">
                      {product.unitsSold} unit{product.unitsSold === 1 ? "" : "s"} sold
                    </span>
                  </div>
                  <span className="text-admin-sm font-bold text-admin-text-primary">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-admin-sm text-admin-text-secondary py-4 text-center">No product sales yet.</p>
            )}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <h3 className="text-admin-base font-bold text-admin-text-primary">Orders by Status</h3>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} />
          ) : (
            <p className="text-admin-sm text-admin-text-secondary py-12 text-center">No orders to display.</p>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="bg-admin-surface border border-admin-border rounded-admin-lg p-admin-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-admin-status-warning-text" />
            <h3 className="text-admin-base font-bold text-admin-text-primary">Low Stock Alert</h3>
          </div>
          <div className="divide-y divide-admin-border">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-admin-sm font-semibold text-admin-text-primary">
                      {item.productName}
                    </span>
                    <span className="text-admin-xs text-admin-text-secondary font-mono">
                      SKU: {item.sku}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-admin-xs font-bold bg-admin-status-danger-bg text-admin-status-danger-text px-2 py-0.5 rounded-admin-sm">
                      {item.quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-admin-sm text-admin-text-secondary py-4 text-center">All inventory levels healthy.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detail drawer popup */}
      <InspectorPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={selectedOrder ? `Order Detail: ${selectedOrder.orderNumber}` : "Order Details"}
      >
        {selectedOrder ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Total Amount</span>
                <p className="text-admin-lg font-bold text-admin-text-primary mt-0.5">{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="bg-admin-content p-4 rounded-admin-md border border-admin-border space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Customer Name</span>
                <p className="text-admin-sm font-medium text-admin-text-primary mt-0.5">{selectedOrder.customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Items Count</span>
                  <p className="text-admin-sm font-medium text-admin-text-primary mt-0.5">{selectedOrder.itemCount} units</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-admin-text-secondary tracking-wider">Date Created</span>
                  <p className="text-admin-sm font-medium text-admin-text-primary mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-admin-xs text-admin-text-secondary leading-normal italic text-center pt-8">
              Full order timeline and processing options are accessible via the Orders module.
            </p>
          </div>
        ) : (
          <p className="text-admin-sm text-admin-text-secondary">No order selected.</p>
        )}
      </InspectorPanel>
    </Stack>
  )
}
