"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Camera,
  Layers,
  Users,
  Percent,
  BarChart3,
  Megaphone,
  FileText,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Globe,
} from "lucide-react"

interface SubItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  exact?: boolean
  items?: SubItem[]
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
    items: [
      { name: "All Orders", href: "/admin/orders" },
      { name: "Print Invoices", href: "/admin/orders/print" },
    ],
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
    items: [
      { name: "All Products", href: "/admin/products" },
      { name: "AI Photography", href: "/admin/products/ai-photography" },
      { name: "Bulk Import", href: "/admin/products/bulk-upload" },
      { name: "Media Library", href: "/admin/media" },
      { name: "Categories", href: "/admin/categories" },
      { name: "Tags", href: "/admin/tags" },
      { name: "Brands", href: "/admin/brands" },
      { name: "Attributes", href: "/admin/attributes" },
      { name: "Inventory Matrix", href: "/admin/inventory" },
    ],
  },
  { name: "Photography Studio", href: "/admin/products/ai-photography", icon: Camera },
  { name: "Collections", href: "/admin/collections", icon: Layers },
  {
    name: "Customers",
    href: "/admin/users",
    icon: Users,
    items: [
      { name: "All Customers", href: "/admin/users" },
      { name: "Customer Inquiries", href: "/admin/inquiries" },
      { name: "Feedback & Stock Alerts", href: "/admin/customer-feedback" },
    ],
  },
  {
    name: "Discount & Offers",
    href: "/admin/coupons",
    icon: Percent,
    items: [
      { name: "Coupons & Discounts", href: "/admin/coupons" },
      { name: "Off Section Deals", href: "/admin/off-section" },
    ],
  },
  { name: "Analytics", href: "/admin/cdp", icon: BarChart3 },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "SEO Center", href: "/admin/seo", icon: Globe },
  {
    name: "Content & CMS",
    href: "/admin/cms/pages",
    icon: FileText,
    items: [
      { name: "All Pages", href: "/admin/cms/pages" },
      { name: "Homepage Builder", href: "/admin/cms/homepage" },
      { name: "Announcements & Banners", href: "/admin/cms/announcements" },
      { name: "Journal & Blog", href: "/admin/content/journal" },
      { name: "Navigation Menus", href: "/admin/cms/navigation" },
      { name: "About Page", href: "/admin/cms/about" },
      { name: "Login CMS", href: "/admin/cms/login" },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings/general",
    icon: SettingsIcon,
    items: [
      { name: "General Settings", href: "/admin/settings/general" },
      { name: "Privacy & Cookies", href: "/admin/settings/privacy" },
      { name: "Feature Flags", href: "/admin/settings/features" },
      { name: "Store & Payments", href: "/admin/settings/store/payments" },
      { name: "Shipping & Delivery", href: "/admin/settings/store/shipping" },
      { name: "Appearance & Theme", href: "/admin/settings/appearance/theme" },
      { name: "Maintenance Mode", href: "/admin/settings/maintenance" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [collapsed, setCollapsed] = useState(false)

  // Helper to check if a path is active
  const isPathActive = (href: string, exact = false) => {
    if (!pathname) return false
    const cleanPath = pathname.split("?")[0]
    const cleanHref = href.split("?")[0]
    if (exact || cleanHref === "/admin") {
      return cleanPath === cleanHref
    }
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/")
  }

  // Check if group contains active path
  const isGroupActive = (item: NavItem) => {
    if (item.exact || !item.items) {
      return isPathActive(item.href, item.exact)
    }
    if (isPathActive(item.href, true)) {
      return true
    }
    return item.items.some((sub) => isPathActive(sub.href))
  }

  // Initialize group states on mount and path change
  useEffect(() => {
    if (!pathname) return
    const currentGroups: Record<string, boolean> = { ...openGroups }
    navItems.forEach((item) => {
      if (item.items && (isPathActive(item.href, false) || item.items.some((sub) => isPathActive(sub.href)))) {
        currentGroups[item.name] = true
      }
    })
    setOpenGroups(currentGroups)
  }, [pathname])

  // Load persistence of collapsed state on mount
  useEffect(() => {
    const saved = localStorage.getItem("xinvora-admin-sidebar-collapsed")
    if (saved === "true") {
      setCollapsed(true)
    }
  }, [])

  const handleCollapseToggle = (val: boolean) => {
    setCollapsed(val)
    localStorage.setItem("xinvora-admin-sidebar-collapsed", String(val))
  }

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleParentClick = (item: NavItem) => {
    if (collapsed) {
      handleCollapseToggle(false)
    }
    setOpenGroups((prev) => ({
      ...prev,
      [item.name]: true,
    }))
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-admin-sidebar-bg text-admin-sidebar-text flex flex-col flex-shrink-0 z-30 select-none border-r border-admin-border overflow-hidden"
    >
      {/* Wordmark Logo with Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border bg-admin-sidebar-bg flex-shrink-0">
        {!collapsed ? (
          <>
            <Link href="/admin" className="flex items-center gap-2 overflow-hidden group">
              <span className="font-display text-admin-sidebar-text-active text-lg font-bold tracking-wider group-hover:text-white transition-colors">
                XINVORA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-admin-text-secondary bg-admin-border px-1.5 py-0.5 rounded-sm">
                Admin
              </span>
            </Link>
            <button
              onClick={() => handleCollapseToggle(true)}
              className="p-1.5 rounded hover:bg-admin-sidebar-item-active-bg text-admin-sidebar-text hover:text-admin-sidebar-text-active transition-colors focus:outline-none"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleCollapseToggle(false)}
            className="w-full flex justify-center p-1.5 rounded hover:bg-admin-sidebar-item-active-bg text-admin-sidebar-text hover:text-admin-sidebar-text-active transition-colors focus:outline-none"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {navItems.map((item) => {
          const hasSubItems = Boolean(item.items && item.items.length > 0)
          const isOpen = Boolean(openGroups[item.name])
          const isActive = isGroupActive(item)

          if (hasSubItems) {
            return (
              <div key={item.name} className="space-y-0.5">
                {/* Navigation item with link and toggle */}
                <div
                  className={`w-full flex items-center rounded-admin-md transition-all group ${
                    isActive
                      ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active"
                      : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleParentClick(item)}
                    title={collapsed ? item.name : undefined}
                    className={`flex-1 flex items-center gap-3 px-3 py-2 text-admin-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}
                  </Link>

                  {!collapsed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleGroup(item.name)
                      }}
                      className="p-2 hover:text-admin-sidebar-text-active text-admin-sidebar-text/70 transition-colors focus:outline-none"
                      aria-label={`Toggle ${item.name} submenu`}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Sub Items */}
                <AnimatePresence initial={false}>
                  {isOpen && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="overflow-hidden pl-7 pr-2 space-y-0.5 py-0.5 border-l border-zinc-800 ml-4"
                    >
                      {item.items?.map((sub) => {
                        const isSubActive = isPathActive(sub.href, sub.href === item.href)
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`block px-2.5 py-1.5 rounded text-admin-xs font-normal transition-colors whitespace-nowrap truncate ${
                              isSubActive
                                ? "bg-white/10 text-white font-medium shadow-xs"
                                : "text-admin-sidebar-text hover:text-admin-sidebar-text-active hover:bg-white/5"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          // Top Level Navigation Link (no sub-items)
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2 text-admin-sm font-medium rounded-admin-md transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active font-semibold"
                  : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Quick Settings Shortcut at Bottom */}
      <div className="p-3 border-t border-admin-border bg-admin-sidebar-bg flex-shrink-0">
        <Link
          href="/admin/settings/general"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-admin-sm font-medium rounded-admin-md transition-all ${
            collapsed ? "justify-center" : ""
          } ${
            isPathActive("/admin/settings")
              ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active"
              : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
          }`}
        >
          <SettingsIcon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap truncate">Settings</span>}
        </Link>
      </div>
    </motion.aside>
  )
}
