"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const settingsNav = [
  {
    title: "Overview",
    items: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Maintenance Mode", href: "/admin/settings/maintenance" },
      { name: "System Info", href: "/admin/settings/system" },
    ]
  },
  {
    title: "Store",
    items: [
      { name: "Contact Info", href: "/admin/settings/store/contact" },
      { name: "Shipping", href: "/admin/settings/store/shipping" },
      { name: "Taxes & VAT", href: "/admin/settings/store/taxes" },
      { name: "Invoice", href: "/admin/settings/store/invoice" },
      { name: "Payments & QR", href: "/admin/settings/store/payments" },
    ]
  },
  {
    title: "Appearance",
    items: [
      { name: "Theme", href: "/admin/settings/appearance/theme" },
      { name: "Homepage Layout", href: "/admin/settings/appearance/homepage" },
      { name: "Announcement Banner", href: "/admin/settings/appearance/announcement" },
    ]
  },
  {
    title: "Advanced",
    items: [
      { name: "Feature Toggles", href: "/admin/settings/features" },
      { name: "SEO Settings", href: "/admin/settings/seo" },
    ]
  }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-text-primary">Control Center</h1>
        <p className="text-text-secondary mt-1">Manage your store's configuration, features, and appearance.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="space-y-8 sticky top-8">
            {settingsNav.map((group, i) => (
              <div key={i}>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (pathname === "/admin/settings" && item.href === "/admin/settings/general")
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-md transition-colors relative",
                          isActive 
                            ? "text-brand-black font-medium" 
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-settings-tab"
                            className="absolute inset-0 bg-surface-secondary rounded-md -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
