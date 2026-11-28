import { SessionService } from "@/services/session.service"
import { ProfileService } from "@/services/profile.service"
import { OrderService } from "@/services/order.service"
import { AddressService } from "@/services/address.service"
import { getWishlistVariantIds } from "@/db/queries/wishlist"
import { NotificationService } from "@/services/notification.service"
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
  Headphones,
  User,
  Plus
} from "lucide-react"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Dashboard | XINVORA",
  description: "XINVORA customer account center",
}

export default async function DashboardPage() {
  const session = await SessionService.requireAuth()

  const [profile, ordersResult, recentOrders, wishlistIds, savedAddresses, notifications] = await Promise.all([
    ProfileService.getOrCreateProfile(session.id),
    OrderService.getUserOrders(session.id, { limit: 1 }),
    OrderService.getRecentOrdersWithItems(session.id, 3),
    getWishlistVariantIds(session.id),
    AddressService.getUserAddresses(session.id),
    NotificationService.getNotifications(session.id),
  ])

  if (!profile) {
    redirect("/login")
  }

  const wishlistCount = wishlistIds.length
  const unreadNotificationsCount = notifications.filter((n: any) => !n.isRead).length
  const userDisplayName = profile.firstName || profile.lastName 
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() 
    : session.email?.split("@")[0] || "Client"

  return (
    <div className="space-y-6">
      {/* ── Welcome Header ── */}
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
              Welcome Back
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A110F] font-normal">
            Hello, {userDisplayName}
          </h1>
          <p className="text-xs text-[#8C7A72] mt-1">
            Manage your recent orders, delivery addresses, and personal preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/account/profile"
            className="px-4 py-2 bg-[#FAF6F2] hover:bg-[#F2EFEA] border border-[#EDE3DB] text-xs font-medium text-[#1A110F] transition-colors rounded-xl inline-flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-[#B89563]" />
            <span>Edit Profile</span>
          </Link>
          <Link
            href="/account/orders"
            className="px-4 py-2 bg-[#1A110F] hover:bg-[#33221E] text-white text-xs font-medium transition-colors rounded-xl inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E6D5C3]" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      {/* ── Quick Metrics Row ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Orders Card */}
        <Link
          href="/account/orders"
          className="bg-white rounded-2xl border border-[#EDE3DB] p-3 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#B89563]/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8C7A72]">
              Orders
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] group-hover:bg-[#1A110F] group-hover:text-white transition-colors">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-medium text-[#1A110F] block">
              {ordersResult.total}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#8C7A72] group-hover:text-[#1A110F] transition-colors mt-1">
              <span>View history</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Wishlist Card */}
        <Link
          href="/wishlist"
          className="bg-white rounded-2xl border border-[#EDE3DB] p-3 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#B89563]/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8C7A72]">
              Wishlist
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] group-hover:bg-[#1A110F] group-hover:text-white transition-colors">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-medium text-[#1A110F] block">
              {wishlistCount}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#8C7A72] group-hover:text-[#1A110F] transition-colors mt-1">
              <span>Saved items</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Notifications / Alerts */}
        <Link
          href="/account/notifications"
          className="bg-white rounded-2xl border border-[#EDE3DB] p-3 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#B89563]/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8C7A72]">
              Alerts
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] group-hover:bg-[#1A110F] group-hover:text-white transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-medium text-[#1A110F] block">
              {unreadNotificationsCount}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#8C7A72] group-hover:text-[#1A110F] transition-colors mt-1">
              <span>Unread alerts</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </div>

      {/* ── Main 2-Column Split: Recent Orders & Saved Addresses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-[#F2EFEA] mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#B89563]" />
                <h2 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase">
                  Recent Orders
                </h2>
              </div>
              <Link
                href="/account/orders"
                className="text-xs text-[#8C7A72] hover:text-[#1A110F] font-medium inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#1A110F]">No orders placed yet</p>
                <p className="text-xs text-[#8C7A72] mt-1 max-w-xs">
                  Browse our latest seasonal collection and find your signature style.
                </p>
                <Link
                  href="/collections"
                  className="mt-4 px-4 py-2 bg-[#1A110F] text-white text-xs rounded-xl font-medium hover:bg-[#33221E] transition-colors"
                >
                  Discover Collections
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F2EFEA]">
                {recentOrders.map((o) => {
                  const totalItemsCount = o.orderItems.reduce((acc, item) => acc + item.quantity, 0)
                  const firstItem = o.orderItems?.[0]
                  // @ts-ignore
                  const orderImage = firstItem?.variant?.product?.productImages?.[0]?.url || firstItem?.variant?.images?.[0]?.url
                  const orderDate = new Date(o.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })

                  const statusConfig: Record<string, string> = {
                    DELIVERED: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
                    PAID: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
                    SHIPPED: "bg-blue-50 text-blue-800 border-blue-200/80",
                    PROCESSING: "bg-amber-50 text-amber-800 border-amber-200/80",
                    PENDING_PAYMENT: "bg-[#FAF6F2] text-[#8C7A72] border-[#EDE3DB]",
                    CANCELLED: "bg-rose-50 text-rose-800 border-rose-200/80"
                  }
                  const badgeClass = statusConfig[o.status] || "bg-[#FAF6F2] text-[#8C7A72] border-[#EDE3DB]"

                  return (
                    <Link
                      key={o.id}
                      href={`/account/orders/${o.orderNumber}`}
                      className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group hover:bg-[#FAF6F2]/50 -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-14 rounded-lg bg-[#FAF6F2] border border-[#EDE3DB] relative overflow-hidden shrink-0">
                          {orderImage ? (
                            <Image
                              src={orderImage}
                              alt="Order Product"
                              fill
                              className="object-cover object-top"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-wider text-[#8C7A72] font-semibold">
                              XINV
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-[#1A110F] truncate group-hover:text-[#B89563] transition-colors">
                            {firstItem?.productName || o.orderNumber}
                            {o.orderItems.length > 1 && (
                              <span className="text-[11px] text-[#8C7A72] font-normal ml-1">
                                +{o.orderItems.length - 1} more
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#8C7A72] mt-0.5">
                            {orderDate} · {totalItemsCount} {totalItemsCount === 1 ? "piece" : "pieces"}
                          </p>
                          <p className="text-xs font-semibold text-[#1A110F] mt-1">
                            NPR {Math.round(o.total / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeClass}`}>
                          {o.status.replace("_", " ")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8C7A72] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F2EFEA] mt-4">
            <Link
              href="/account/orders"
              className="block w-full text-center py-2.5 rounded-xl border border-[#EDE3DB] text-xs font-medium text-[#1A110F] hover:bg-[#FAF6F2] transition-colors"
            >
              View Order History
            </Link>
          </div>
        </div>

        {/* Saved Addresses Card */}
        <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-[#F2EFEA] mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B89563]" />
                <h2 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase">
                  Default Delivery Address
                </h2>
              </div>
              <Link
                href="/account/addresses"
                className="text-xs text-[#8C7A72] hover:text-[#1A110F] font-medium inline-flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#1A110F]">No saved addresses yet</p>
                <p className="text-xs text-[#8C7A72] mt-1 max-w-xs">
                  Save your home or work delivery address for a fast, 1-tap checkout experience.
                </p>
                <Link
                  href="/account/addresses"
                  className="mt-4 px-4 py-2 bg-[#1A110F] text-white text-xs rounded-xl font-medium hover:bg-[#33221E] transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 py-1">
                {savedAddresses.slice(0, 2).map((a: any) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl border border-[#EDE3DB] bg-[#FAF6F2]/60 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1A110F]">
                          {a.fullName || `${a.firstName || ""} ${a.lastName || ""}`.trim()}
                        </span>
                        {a.isDefaultShipping && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-white border border-[#EDE3DB] text-[#B89563] px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {a.phone && (
                        <span className="text-xs text-[#8C7A72]">
                          {a.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#73645D] mt-2 leading-relaxed">
                      {[a.tole, a.street, a.landmark].filter(Boolean).join(", ") || a.line1}
                      {(a.municipality || a.city) && `, ${a.municipality || a.city}`}
                      {a.district && `, ${a.district}`}
                      {a.province && `, ${a.province}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F2EFEA] mt-4">
            <Link
              href="/account/addresses"
              className="block w-full text-center py-2.5 rounded-xl border border-[#EDE3DB] text-xs font-medium text-[#1A110F] hover:bg-[#FAF6F2] transition-colors"
            >
              Manage Saved Addresses
            </Link>
          </div>
        </div>
      </div>

      {/* ── Client Concierge & Service Guarantees ── */}
      <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="text-left mb-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase">
            XINVORA Standards
          </p>
          <h3 className="font-serif text-lg text-[#1A110F]">
            Client Assurances &amp; Concierge Support
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F2]/50 border border-[#EDE3DB]/60">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EDE3DB] flex items-center justify-center text-[#B89563] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1A110F]">Flat NPR 170 Shipping</h4>
              <p className="text-[11px] text-[#8C7A72] mt-0.5">Reliable delivery nationwide</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F2]/50 border border-[#EDE3DB]/60">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EDE3DB] flex items-center justify-center text-[#B89563] shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1A110F]">7-Day Returns</h4>
              <p className="text-[11px] text-[#8C7A72] mt-0.5">Hassle-free size exchange</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F2]/50 border border-[#EDE3DB]/60">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EDE3DB] flex items-center justify-center text-[#B89563] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1A110F]">100% Genuine Quality</h4>
              <p className="text-[11px] text-[#8C7A72] mt-0.5">Artisanal craft &amp; verification</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F2]/50 border border-[#EDE3DB]/60">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EDE3DB] flex items-center justify-center text-[#B89563] shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1A110F]">Client Concierge</h4>
              <p className="text-[11px] text-[#8C7A72] mt-0.5">Assistance via WhatsApp/phone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
