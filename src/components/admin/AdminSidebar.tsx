"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Users,
  Percent,
  BarChart3,
  Megaphone,
  FileText,
  Printer,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react"

interface SubItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href?: string
  icon: LucideIcon
  exact?: boolean
  items?: SubItem[]
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Orders", href: "/admin/orders", icon: Package },
  {
    name: "Products",
    icon: ShoppingBag,
    items: [
      { name: "All Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/categories" },
      { name: "Tags", href: "/admin/tags" },
      { name: "Brands", href: "/admin/brands" },
      { name: "Attributes", href: "/admin/attributes" },
    ],
  },
  { name: "Collections", href: "/admin/collections", icon: Layers },
  { name: "Customers", href: "/admin/users", icon: Users },
  {
    name: "Discount & Offers",
    icon: Percent,
    items: [
      { name: "Discount", href: "/admin/coupons" },
      { name: "Couple Section", href: "/admin/couple-section" },
      { name: "Off Section", href: "/admin/off-section" },
    ],
  },
  { name: "Analytics", href: "/admin/cdp", icon: BarChart3 },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  {
    name: "Content",
    icon: FileText,
    items: [
      { name: "Homepage Builder", href: "/admin/cms/homepage" },
      { name: "All Content", href: "/admin/cms/pages" },
      { name: "Pages", href: "/admin/cms/pages" },
      { name: "Banners", href: "/admin/cms/banners" },
      { name: "Blog Posts", href: "/admin/cms/posts" },
      { name: "Media Library", href: "/admin/cms/media" },
      { name: "Navigation", href: "/admin/cms/navigation" },
      { name: "FAQ", href: "/admin/cms/faq" },
      { name: "Lookbook", href: "/admin/cms/lookbook" },
    ],
  },
  { name: "Print Invoices", href: "/admin/orders/print", icon: Printer },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [collapsed, setCollapsed] = useState(false)

  // Helper to check if a path is active
  const isPathActive = (href: string, exact = false) => {
    if (!pathname) return false
    if (exact) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  // Check if group contains active path
  const isGroupActive = (item: NavItem) => {
    if (item.href) {
      return isPathActive(item.href, item.exact)
    }
    if (item.items) {
      return item.items.some((sub) => isPathActive(sub.href))
    }
    return false
  }

  // Initialize group states on mount based on active pathname
  useEffect(() => {
    if (!pathname) return
    const initialGroups: Record<string, boolean> = {}
    navItems.forEach((item) => {
      if (item.items && item.items.some((sub) => isPathActive(sub.href))) {
        initialGroups[item.name] = true
      }
    })
    setOpenGroups(initialGroups)
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

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-admin-sidebar-bg text-admin-sidebar-text flex flex-col flex-shrink-0 z-30 select-none border-r border-admin-border overflow-hidden"
    >
      {/* Wordmark Logo with Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border bg-admin-sidebar-bg">
        {!collapsed ? (
          <>
            <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
              <span className="font-display text-admin-sidebar-text-active text-lg font-bold tracking-wider">
                XINVORA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-admin-text-secondary bg-admin-border px-1.5 py-0.5 rounded-sm">
                Admin
              </span>
            </Link>
            <button
              onClick={() => handleCollapseToggle(true)}
              className="p-1.5 rounded hover:bg-admin-sidebar-item-active-bg text-admin-sidebar-text hover:text-admin-sidebar-text-active transition-colors focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleCollapseToggle(false)}
            className="w-full flex justify-center p-1.5 rounded hover:bg-admin-sidebar-item-active-bg text-admin-sidebar-text hover:text-admin-sidebar-text-active transition-colors focus:outline-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {navItems.map((item) => {
          const hasSubItems = !!item.items
          const isOpen = !!openGroups[item.name]
          const isActive = isGroupActive(item)

          if (hasSubItems) {
            return (
              <div key={item.name} className="space-y-1">
                {/* Expandable Header */}
                <button
                  onClick={() => {
                    if (collapsed) {
                      handleCollapseToggle(false)
                      setOpenGroups((prev) => ({ ...prev, [item.name]: true }))
                    } else {
                      toggleGroup(item.name)
                    }
                  }}
                  title={collapsed ? item.name : undefined}
                  className={`w-full flex items-center px-3 py-2 text-admin-base font-medium rounded-admin-md transition-all group ${
                    collapsed ? "justify-center" : "justify-between"
                  } ${
                    isActive
                      ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active"
                      : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-250 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub Items */}
                <AnimatePresence initial={false}>
                  {isOpen && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden pl-11 pr-2 space-y-1"
                    >
                      {item.items?.map((sub) => {
                        const isSubActive = isPathActive(sub.href)
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`block py-1.5 text-admin-sm font-normal transition-colors whitespace-nowrap ${
                              isSubActive
                                ? "text-admin-sidebar-text-active"
                                : "text-admin-sidebar-text hover:text-admin-sidebar-text-active"
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

          // Top Level Navigation Link
          return (
            <Link
              key={item.name}
              href={item.href || "#"}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2 text-admin-base font-medium rounded-admin-md transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active"
                  : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Settings Pinned at Bottom */}
      <div className="p-3.5 border-t border-admin-border bg-admin-sidebar-bg">
        <Link
          href="/admin/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-admin-base font-medium rounded-admin-md transition-all ${
            collapsed ? "justify-center" : ""
          } ${
            isPathActive("/admin/settings")
              ? "bg-admin-sidebar-item-active-bg text-admin-sidebar-text-active"
              : "hover:bg-admin-sidebar-item-active-bg hover:text-admin-sidebar-text-active text-admin-sidebar-text"
          }`}
        >
          <SettingsIcon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Settings</span>}
        </Link>
      </div>
    </motion.aside>
  )
}
