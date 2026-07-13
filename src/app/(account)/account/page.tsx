import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { OrderService } from "@/services/order.service"
import { AddressService } from "@/services/address.service"
import { getWishlistVariantIds } from "@/db/queries/wishlist"
import { NotificationService } from "@/services/notification.service"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import {
  ShoppingBag,
  Bookmark,
  Heart,
  Bell,
  MapPin,
  ChevronRight,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones
} from "lucide-react"

export const metadata = {
  title: "My Dashboard | XINVORA",
  description: "XINVORA customer account center",
}

export default async function DashboardPage() {
  const session = await SessionService.requireAuth()

  const [profile, ordersResult, recentOrders, wishlistIds, savedAddresses, notifications] = await Promise.all([
    ProfileService.getOrCreateProfile(session.id),
    OrderService.getUserOrders(session.id, { limit: 1 }), // for count
    OrderService.getRecentOrdersWithItems(session.id, 3), // for detail
    getWishlistVariantIds(session.id),
    AddressService.getUserAddresses(session.id),
    NotificationService.getNotifications(session.id),
  ])

  const wishlistCount = wishlistIds.length
  const unreadNotificationsCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <Stack gap={8}>
      {/* Welcome Header */}
      <div className="border-b border-[#F2EFEA] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#9A9087] uppercase">Welcome Back</span>
          <h1 className="text-display-sm font-display text-[#3A3530] uppercase tracking-wide mt-1">
            {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.email}
          </h1>
          <p className="text-body-xs text-[#9A9087] mt-1">It's great to see you again.</p>
        </div>
        <div className="flex shrink-0">
          <Link href="/account/profile" className="px-5 py-2.5 bg-white border border-[#E2DDD5] text-[10px] uppercase tracking-wider font-semibold text-[#3A3530] hover:bg-[#FAF9F6] transition-colors rounded-sm">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Row of 3 Status Cards (Desktop: 3 columns, Mobile: 3 columns with compact layouts) */}
      <Grid cols={{ base: 3, md: 3 }} gap={4}>
        {/* Order Status */}
        <div className="bg-white border border-[#F2EFEA] rounded-xl p-3 md:p-5 flex items-center md:items-start gap-2.5 md:gap-4 hover:border-[#D6CFB4] transition-all duration-300">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <ShoppingBag className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-[#9A9087] uppercase truncate">
              <span className="md:hidden">Orders</span>
              <span className="hidden md:inline">Order Status</span>
            </span>
            <p className="text-body-md md:text-[28px] font-semibold md:font-light text-[#3A3530] leading-none mt-0.5 md:mt-1.5">{ordersResult.total}</p>
            <Link href="/account/orders" className="hidden md:flex text-[10px] text-[#9A9087] hover:text-[#3A3530] items-center gap-1 mt-2.5 group">
              <span>Total placed orders</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="bg-white border border-[#F2EFEA] rounded-xl p-3 md:p-5 flex items-center md:items-start gap-2.5 md:gap-4 hover:border-[#D6CFB4] transition-all duration-300">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <Bookmark className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-[#9A9087] uppercase truncate">
              <span className="md:hidden">Wishlist</span>
              <span className="hidden md:inline">Wishlist Items</span>
            </span>
            <p className="text-body-md md:text-[28px] font-semibold md:font-light text-[#3A3530] leading-none mt-0.5 md:mt-1.5">{wishlistCount}</p>
            <Link href="/account/wishlist" className="hidden md:flex text-[10px] text-[#9A9087] hover:text-[#3A3530] items-center gap-1 mt-2.5 group">
              <span>Items saved for later</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-[#F2EFEA] rounded-xl p-3 md:p-5 flex items-center md:items-start gap-2.5 md:gap-4 hover:border-[#D6CFB4] transition-all duration-300">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <Bell className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-[#9A9087] uppercase truncate">
              <span className="md:hidden">Alerts</span>
              <span className="hidden md:inline">Notifications</span>
            </span>
            <p className="text-body-md md:text-[28px] font-semibold md:font-light text-[#3A3530] leading-none mt-0.5 md:mt-1.5">{unreadNotificationsCount}</p>
            <Link href="/account/notifications" className="hidden md:flex text-[10px] text-[#9A9087] hover:text-[#3A3530] items-center gap-1 mt-2.5 group">
              <span>Unread updates</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Grid>

      {/* Main split grid */}
      <Grid cols={{ base: 1, lg: 2 }} gap={6}>
        {/* Recent Orders Card */}
        <div className="bg-white border border-[#F2EFEA] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-[#F2EFEA] mb-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#3A3530] uppercase">Recent Orders</h3>
              <Link href="/account/orders" className="text-[10px] uppercase tracking-wider text-[#9A9087] hover:text-[#3A3530] underline font-semibold">
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-body-sm text-[#9A9087] py-10 text-center">No orders placed yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-[#F2EFEA]/60">
                {recentOrders.map((o) => {
                  const totalItemsCount = o.orderItems.reduce((acc, item) => acc + item.quantity, 0)
                  const firstItem = o.orderItems?.[0]
                  // @ts-ignore
                  const orderImage = firstItem?.variant?.product?.productImages?.[0]?.url
                  const orderDate = new Date(o.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })

                  return (
                    <Link key={o.id} href={`/account/orders/${o.orderNumber}`} className="flex items-center justify-between py-4 first:pt-2 last:pb-2 group">
                      <div className="flex items-center gap-4 text-left">
                        {/* Product Image */}
                        <div className="w-12 h-16 bg-[#FAF8F5] border border-[#F2EFEA] rounded-sm overflow-hidden relative shrink-0">
                          {orderImage ? (
                            <Image src={orderImage} alt="Order Product" fill className="object-cover object-top" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] uppercase text-[#9A9087] font-semibold bg-[#FAF8F5]">
                              XINV
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col">
                          <span className="font-mono text-body-xs font-semibold text-[#3A3530]">{o.orderNumber}</span>
                          <span className="text-[10px] text-[#9A9087] mt-1">{orderDate}</span>
                          <span className="text-[10px] text-[#9A9087] mt-0.5 font-medium">
                            {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'} • {o.currency} {Math.round(o.total / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${o.status === "DELIVERED" || o.status === "PAID"
                            ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#16A34A]"
                            : o.status === "SHIPPED"
                              ? "bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]"
                              : "bg-[#FAF9F6] border-[#F2EFEA] text-[#6C635B]"
                          }`}>
                          {o.status.replace("_", " ")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#9A9087] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <Link href="/account/orders" className="block w-full text-center py-3 border border-[#E2DDD5] text-[10px] uppercase tracking-wider font-semibold text-[#3A3530] hover:bg-[#FAF9F6] transition-colors rounded-sm mt-4">
            View All Orders
          </Link>
        </div>

        {/* Saved Addresses Card */}
        <div className="bg-white border border-[#F2EFEA] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-[#F2EFEA] mb-2">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#3A3530] uppercase">Saved Addresses</h3>
              <Link href="/account/addresses" className="text-[10px] uppercase tracking-wider text-[#9A9087] hover:text-[#3A3530] underline font-semibold">
                Manage Addresses
              </Link>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] mb-4">
                  <MapPin className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h4 className="text-body-sm font-semibold text-[#3A3530] mb-1">No saved addresses yet</h4>
                <p className="text-body-xs text-[#9A9087] max-w-[15rem] leading-relaxed mb-6">
                  Add a delivery address for a faster checkout experience.
                </p>
                <Link href="/account/addresses" className="w-full">
                  <button className="w-full py-3 bg-[#1E1A16] hover:bg-[#3A3530] text-white text-[10px] uppercase tracking-wider font-semibold transition-colors rounded-sm">
                    Add New Address
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {savedAddresses.slice(0, 2).map((a: any) => (
                  <div key={a.id} className="p-4 border border-[#F2EFEA] bg-[#FBFBFA] rounded-lg text-left">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9087]">{a.label || "Address"}</span>
                      <div className="flex gap-1.5">
                        {a.isDefaultShipping && <span className="text-[8px] bg-[#FAF8F5] border border-[#E2DDD5] text-[#3A3530] px-1.5 py-0.5 tracking-wider uppercase font-semibold">Shipping</span>}
                        {a.isDefaultBilling && <span className="text-[8px] bg-white border border-[#F2EFEA] text-[#9A9087] px-1.5 py-0.5 tracking-wider uppercase font-semibold">Billing</span>}
                      </div>
                    </div>
                    <p className="text-body-sm mt-2 font-medium text-[#3A3530]">{a.firstName} {a.lastName}</p>
                    <p className="text-body-sm text-[#6C635B] mt-0.5 leading-relaxed">{a.line1}, {a.city}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {savedAddresses.length > 0 && (
            <Link href="/account/addresses" className="block w-full text-center py-3 border border-[#E2DDD5] text-[10px] uppercase tracking-wider font-semibold text-[#3A3530] hover:bg-[#FAF9F6] transition-colors rounded-sm mt-4">
              Manage Addresses
            </Link>
          )}
        </div>
      </Grid>

      {/* Bottom Trust Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-[#F2EFEA] mt-16 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <Truck className="w-4.5 h-4.5 stroke-[1.25]" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#3A3530] uppercase tracking-wider">Free Shipping</h4>
            <p className="text-[10px] text-[#9A9087] mt-0.5">On orders over NPR 5,000</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <RotateCcw className="w-4.5 h-4.5 stroke-[1.25]" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#3A3530] uppercase tracking-wider">Easy Returns</h4>
            <p className="text-[10px] text-[#9A9087] mt-0.5">14-day return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 stroke-[1.25]" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#3A3530] uppercase tracking-wider">Secure Payments</h4>
            <p className="text-[10px] text-[#9A9087] mt-0.5">100% secure checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#F2EFEA] flex items-center justify-center text-[#9A9087] shrink-0">
            <Headphones className="w-4.5 h-4.5 stroke-[1.25]" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#3A3530] uppercase tracking-wider">Customer Support</h4>
            <p className="text-[10px] text-[#9A9087] mt-0.5">We're here to help</p>
          </div>
        </div>
      </div>
    </Stack>
  )
}
