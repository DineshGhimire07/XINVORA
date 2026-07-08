import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { OrderService } from "@/services/order.service"
import { AddressService } from "@/services/address.service"
import { getWishlist } from "@/db/queries/wishlist"
import { NotificationService } from "@/services/notification.service"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata = {
  title: "My Dashboard | XINVORA",
  description: "XINVORA customer account center",
}

export default async function DashboardPage() {
  const session = await SessionService.requireAuth()
  const profile = await ProfileService.getProfile(session.id)
  
  // Recent 2 orders
  const ordersResult = await OrderService.getUserOrders(session.id, { limit: 2 })
  
  // Wishlist preview
  const wishlist = await getWishlist(session.id)
  const wishlistCount = wishlist?.items.length ?? 0
  
  // Saved addresses
  const savedAddresses = await AddressService.getUserAddresses(session.id)
  
  // Recent notifications
  const notifications = await NotificationService.getNotifications(session.id)
  const unreadNotificationsCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <Stack gap={8}>
      {/* Welcome Card */}
      <div className="border-b border-border-primary/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">Welcome Back</span>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mt-1">
            {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.email}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/account/profile" className="px-4 py-2 border border-border text-[11px] uppercase tracking-wider font-medium hover:bg-surface-secondary/20 transition-all">
            Edit Profile
          </Link>
        </div>
      </div>

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        <Card className="rounded-none border-border-primary/30 shadow-xs bg-surface-secondary/5">
          <CardContent className="pt-6">
            <span className="text-[9px] font-bold tracking-widest text-text-secondary uppercase">Order Status</span>
            <p className="text-display-sm font-light text-text-primary mt-2">{ordersResult.total}</p>
            <span className="text-body-xs text-text-secondary block mt-1">Total placed orders</span>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-primary/30 shadow-xs bg-surface-secondary/5">
          <CardContent className="pt-6">
            <span className="text-[9px] font-bold tracking-widest text-text-secondary uppercase">Wishlist Items</span>
            <p className="text-display-sm font-light text-text-primary mt-2">{wishlistCount}</p>
            <span className="text-body-xs text-text-secondary block mt-1">Items saved for later</span>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-primary/30 shadow-xs bg-surface-secondary/5">
          <CardContent className="pt-6">
            <span className="text-[9px] font-bold tracking-widest text-text-secondary uppercase">Notifications</span>
            <p className="text-display-sm font-light text-accent mt-2">{unreadNotificationsCount}</p>
            <span className="text-body-xs text-text-secondary block mt-1">Unread updates</span>
          </CardContent>
        </Card>
      </Grid>

      {/* Main split grid */}
      <Grid cols={{ base: 1, lg: 2 }} gap={8}>
        {/* Recent Orders */}
        <Card className="rounded-none border-border-primary/40 shadow-sm">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-light tracking-widest uppercase">Recent Orders</CardTitle>
            <Link href="/account/orders" className="text-[10px] uppercase tracking-wider underline hover:text-accent">
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {ordersResult.items.length === 0 ? (
              <p className="text-body-sm text-text-secondary py-4 text-center">No orders placed yet.</p>
            ) : (
              <Stack gap={4} className="divide-y divide-border/40">
                {ordersResult.items.map((o) => (
                  <div key={o.id} className="pt-4 first:pt-0 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-mono text-body-sm text-text-primary">{o.orderNumber}</p>
                      <p className="text-caption text-text-secondary mt-1">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-medium">${(o.total / 100).toFixed(2)}</p>
                      <span className="inline-block mt-1 text-[9px] px-2 py-0.5 border border-border uppercase tracking-widest text-text-secondary">
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Addresses & Saved Info */}
        <Card className="rounded-none border-border-primary/40 shadow-sm">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-light tracking-widest uppercase">Saved Addresses</CardTitle>
            <Link href="/account/addresses" className="text-[10px] uppercase tracking-wider underline hover:text-accent">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {savedAddresses.length === 0 ? (
              <p className="text-body-sm text-text-secondary py-4 text-center">No saved addresses.</p>
            ) : (
              <div className="space-y-4">
                {savedAddresses.slice(0, 2).map((a: any) => (
                  <div key={a.id} className="p-4 border border-border bg-surface-secondary/5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{a.label || "Address"}</span>
                      <div className="flex gap-1.5">
                        {a.isDefaultShipping && <span className="text-[8px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 tracking-wider uppercase font-semibold">Shipping</span>}
                        {a.isDefaultBilling && <span className="text-[8px] bg-surface-secondary border border-border text-text-secondary px-1.5 py-0.5 tracking-wider uppercase font-semibold">Billing</span>}
                      </div>
                    </div>
                    <p className="text-body-sm mt-2">{a.firstName} {a.lastName}</p>
                    <p className="text-body-sm text-text-secondary mt-0.5">{a.line1}, {a.city}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  )
}
