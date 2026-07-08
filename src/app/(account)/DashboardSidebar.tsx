"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function DashboardSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/account", label: "Dashboard Overview" },
    { href: "/account/profile", label: "Personal Info" },
    { href: "/account/orders", label: "Order History" },
    { href: "/account/addresses", label: "Saved Addresses" },
    { href: "/account/wishlist", label: "My Wishlist" },
    { href: "/account/security", label: "Security & Passwords" },
    { href: "/account/notifications", label: "Notification Center" },
    { href: "/account/settings", label: "Preferences" },
  ]

  return (
    <nav className="border border-border-primary/20 bg-surface-secondary/10 p-6 space-y-2 sticky top-32">
      <div className="mb-6">
        <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">My Account</h2>
      </div>
      <ul className="space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block py-2 text-body-sm transition-all duration-200 uppercase tracking-widest text-[11px] ${
                  isActive
                    ? "text-accent font-semibold pl-1"
                    : "text-text-secondary hover:text-text-primary hover:pl-0.5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
