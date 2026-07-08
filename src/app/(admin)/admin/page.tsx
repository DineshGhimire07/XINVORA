import { Stack } from "@/components/shared/stack"
import { Grid } from "@/components/shared/grid"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { db } from "@/db/client"
import { users, orders, inventory } from "@/db/schema"
import { sql } from "drizzle-orm"

export default async function AdminDashboardPage() {
  // Fetch high-level KPIs
  const [usersCountResult, ordersCountResult, lowStockResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(inventory).where(sql`${inventory.status} = 'LOW_STOCK'`),
  ])

  const totalUsers = Number(usersCountResult[0]?.count ?? 0)
  const totalOrders = Number(ordersCountResult[0]?.count ?? 0)
  const lowStockAlerts = Number(lowStockResult[0]?.count ?? 0)

  return (
    <Stack gap={8}>
      <div>
        <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
          Dashboard Overview
        </h1>
        <p className="text-body-sm text-text-secondary mt-2">
          High-level operational metrics for XINVORA.
        </p>
      </div>

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-4">
            <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <span className="text-heading-lg font-bold">{totalOrders}</span>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-4">
            <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <span className="text-heading-lg font-bold">{totalUsers}</span>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-4">
            <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex items-center gap-3">
            <span className={`text-heading-lg font-bold ${lowStockAlerts > 0 ? "text-accent" : "text-text-primary"}`}>
              {lowStockAlerts}
            </span>
            {lowStockAlerts > 0 && (
              <span className="text-[10px] uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 font-semibold">
                Action Required
              </span>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  )
}
