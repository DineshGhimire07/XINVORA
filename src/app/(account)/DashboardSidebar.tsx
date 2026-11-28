"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  Home,
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Bell,
  Lock,
  Sliders,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { logoutAction } from "@/actions/auth.actions"

interface DashboardSidebarProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const mainLinks = [
    { href: "/account", label: "Overview", icon: Home },
    { href: "/account/orders", label: "Orders", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
  ]

  const settingsLinks = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/notifications", label: "Alerts", icon: Bell },
    { href: "/account/security", label: "Security", icon: Lock },
    { href: "/account/settings", label: "Preferences", icon: Sliders },
  ]

  const allLinks = [...mainLinks, ...settingsLinks]

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      router.push("/")
    })
  }

  const userInitial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()
  const displayName = user?.name || user?.email?.split("@")[0] || "Client"

  return (
    <div className="flex flex-col gap-4">
      {/* ── Mobile Navigation: User Header Card + Horizontally Scrollable Pills ── */}
      <div className="lg:hidden flex flex-col gap-3">
        {/* Mobile Quick User Card */}
        <div className="bg-white rounded-xl border border-[#EDE3DB] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#FAF6F2] border border-[#DDD0C6] flex items-center justify-center font-serif font-semibold text-sm text-[#1A110F] shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-medium text-[#1A110F] truncate">
                  {displayName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />
              </div>
              <p className="text-[11px] text-[#8C7A72] truncate">
                {user?.email || "XINVORA Client"}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8C7A72] hover:text-[#1A110F] px-2.5 py-1.5 rounded-lg border border-[#EDE3DB] bg-[#FAF6F2]"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Shop</span>
          </Link>
        </div>

        {/* Mobile Scrollable Tabs */}
        <nav className="w-full bg-white border border-[#EDE3DB] rounded-xl p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {allLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/account/orders" && pathname.startsWith("/account/orders")) ||
              (link.href === "/wishlist" && pathname === "/wishlist")
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-[#1A110F] text-white shadow-xs"
                    : "text-[#73645D] hover:text-[#1A110F] hover:bg-[#FAF6F2]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#E6D5C3]" : "text-[#8C7A72]"}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 shrink-0 transition-colors ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isPending ? "..." : "Exit"}</span>
          </button>
        </nav>
      </div>

      {/* ── Desktop Navigation Card ── */}
      <nav className="hidden lg:block bg-white border border-[#EDE3DB] rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] sticky top-28">
        {/* User Profile Header */}
        <div className="pb-5 border-b border-[#F2EFEA] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#DDD0C6] flex items-center justify-center font-serif text-lg font-semibold text-[#1A110F] shrink-0 shadow-xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="font-serif text-base text-[#1A110F] font-medium truncate">
                {displayName}
              </h2>
            </div>
            <p className="text-xs text-[#8C7A72] truncate mt-0.5">
              {user?.email || "XINVORA Client"}
            </p>
            <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] text-[9px] font-bold uppercase tracking-wider text-[#B89563]">
              <ShieldCheck className="w-2.5 h-2.5 text-[#B89563]" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Section 1: Core Account */}
        <div className="pt-5 pb-3">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase px-3 mb-2">
            My Account
          </p>
          <ul className="space-y-1">
            {mainLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/account/orders" && pathname.startsWith("/account/orders")) ||
                (link.href === "/wishlist" && pathname === "/wishlist")
              const Icon = link.icon

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide font-medium ${
                      isActive
                        ? "bg-[#FAF6F2] text-[#1A110F] font-semibold border border-[#EDE3DB] shadow-xs"
                        : "text-[#73645D] hover:text-[#1A110F] hover:bg-[#FAF6F2]/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#B89563]" : "text-[#8C7A72]"}`} />
                      <span>{link.label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Section 2: Settings & Security */}
        <div className="pt-3 pb-3 border-t border-[#F2EFEA]">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase px-3 mb-2">
            Settings &amp; Preferences
          </p>
          <ul className="space-y-1">
            {settingsLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide font-medium ${
                      isActive
                        ? "bg-[#FAF6F2] text-[#1A110F] font-semibold border border-[#EDE3DB] shadow-xs"
                        : "text-[#73645D] hover:text-[#1A110F] hover:bg-[#FAF6F2]/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#B89563]" : "text-[#8C7A72]"}`} />
                      <span>{link.label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#B89563]" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Section 3: Navigation Actions */}
        <div className="pt-4 mt-2 border-t border-[#F2EFEA] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-[#8C7A72] hover:text-[#1A110F] hover:bg-[#FAF6F2] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors w-full font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
