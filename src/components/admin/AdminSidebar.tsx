"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const adminLinks = [
  { name: "Dashboard", href: "/admin", exact: true },
  { name: "Orders", href: "/admin/orders" },
  { name: "Products", href: "/admin/products" },
  { name: "Inventory", href: "/admin/inventory" },
  { name: "Users", href: "/admin/users" },
  { name: "Inquiries", href: "/admin/inquiries" },
  { name: "Customer Intelligence", href: "/admin/cdp" },
  { name: "System Health", href: "/admin/cdp/health" },
  { name: "CMS Pages", href: "/admin/cms/pages" },
  { name: "Homepage Config", href: "/admin/cms/homepage" },
  { name: "About Page Config", href: "/admin/cms/about" },
  { name: "Navigation", href: "/admin/cms/navigation" },
  { name: "Media", href: "/admin/cms/media" },
  { name: "Announcements", href: "/admin/cms/announcements" },
  { name: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 flex-shrink-0 md:border-r border-b md:border-b-0 border-border h-auto md:h-[calc(100vh-5rem)] md:sticky md:top-20 md:overflow-y-auto bg-surface p-6 flex flex-col">
      <div className="mb-10">
        <Link href="/" className="text-body-sm font-bold tracking-widest uppercase text-text-primary hover:text-accent">
          XINVORA ADMIN
        </Link>
        <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Operational Backend</p>
      </div>

      <nav className="space-y-1">
        {adminLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href)

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2 text-body-sm transition-colors ${
                isActive
                  ? "bg-surface-secondary text-text-primary font-medium border-l-2 border-text-primary"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary border-l-2 border-transparent"
              }`}
            >
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-10">
        <Link
          href="/account"
          className="text-caption text-text-secondary hover:text-text-primary transition-colors underline"
        >
          Return to Account Hub
        </Link>
      </div>
    </aside>
  )
}
