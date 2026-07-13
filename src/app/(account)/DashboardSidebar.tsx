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
  Bookmark,
  Bell,
  Lock,
  Sliders,
  LogOut,
  ArrowLeft
} from "lucide-react"
import { logoutAction } from "@/actions/auth.actions"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const links = [
    { href: "/", label: "Back to Shop", icon: ArrowLeft },
    { href: "/account", label: "Dashboard Overview", icon: Home },
    { href: "/account/profile", label: "Personal Information", icon: User },
    { href: "/account/orders", label: "Order History", icon: ShoppingBag },
    { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
    { href: "/account/wishlist", label: "My Wishlist", icon: Heart },
    { href: "/account/notifications", label: "Notification Center", icon: Bell },
    { href: "/account/security", label: "Security & Passwords", icon: Lock },
    { href: "/account/settings", label: "Preferences", icon: Sliders },
  ]

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      router.push("/")
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Navigation Scrollbar (Hidden on Desktop) */}
      <nav className="lg:hidden w-full bg-[#FBFBFA] border border-[#F2EFEA] rounded-xl p-3 overflow-x-auto scrollbar-none flex gap-2 shrink-0">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href.startsWith("/account/wishlist") && pathname === "/account/wishlist")
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold shrink-0 transition-all border ${isActive
                  ? "bg-[#F5F2EB] text-[#3A3530] border-[#E2DDD5]"
                  : "bg-white text-[#6C635B] border-[#F2EFEA] hover:text-[#3A3530]"
                }`}
            >
              <Icon className="w-[13px] h-[13px] stroke-[1.5] shrink-0" />
              <span>{link.label.split(" ")[0]}</span>
            </Link>
          )
        })}
        {/* Sign Out on mobile */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold shrink-0 bg-white text-[#6C635B] border-[#F2EFEA] hover:text-[#c2410c] hover:border-red-200 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-[13px] h-[13px] stroke-[1.5] shrink-0" />
          <span>{isPending ? "..." : "Exit"}</span>
        </button>
      </nav>

      {/* Desktop Navigation Card (Hidden on Mobile) */}
      <nav className="hidden lg:block border border-[#F2EFEA] bg-[#FBFBFA] rounded-xl p-5">
        <div className="mb-5 px-3">
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#9A9087] uppercase">My Account</h2>
        </div>
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href.startsWith("/account/wishlist") && pathname === "/account/wishlist")
            const Icon = link.icon
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-all duration-200 uppercase tracking-wider text-[11px] font-medium ${isActive
                      ? "bg-[#F5F2EB] text-[#3A3530]"
                      : "text-[#6C635B] hover:text-[#3A3530] hover:bg-[#FAF9F6]"
                    }`}
                >
                  <Icon className="w-[15px] h-[15px] stroke-[1.5] shrink-0" />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Sign Out */}
        <div className="pt-3 mt-3 border-t border-[#F2EFEA] px-3">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-3 py-2 text-[11px] uppercase tracking-wider text-[#6C635B] hover:text-[#c2410c] transition-colors duration-200 disabled:opacity-50 w-full font-medium"
          >
            <LogOut className="w-[15px] h-[15px] stroke-[1.5] shrink-0" />
            <span>{isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
