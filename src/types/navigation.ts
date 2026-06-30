/**
 * types/navigation.ts — XINVORA Navigation Types
 *
 * Defines the data structures for all navigation components.
 * Supports flat nav, nested nav, mega menus, and footer groups.
 */

import type { ProductCategory } from "./brand"
import type { LucideIcon } from "lucide-react"

// ── Base Nav Item ─────────────────────────────────────────────────────────────
export interface NavItem {
  /** Unique identifier for the nav item */
  id: string
  /** Display label */
  label: string
  /** Route path or external URL */
  href: string
  /** Whether this link opens in a new tab */
  external?: boolean
  /** Whether this nav item is disabled */
  disabled?: boolean
  /** Optional Lucide icon */
  icon?: LucideIcon
  /** Badge text (e.g., "New", "Sale") */
  badge?: string
}

// ── Nav Group — for nested navigation ────────────────────────────────────────
export interface NavGroup {
  id: string
  label: string
  /** Optional top-level href (if the group itself is clickable) */
  href?: string
  items: NavItem[]
  /** Whether the group should be shown as a mega menu column */
  featured?: boolean
}

// ── Mega Menu ─────────────────────────────────────────────────────────────────
export interface MegaMenuPanel {
  id: string
  label: string
  href?: string
  columns: NavGroup[]
  /** Optional featured editorial content shown in the panel */
  editorial?: {
    title: string
    description: string
    image?: string
    href: string
  }
}

// ── Main Navigation ───────────────────────────────────────────────────────────
export type MainNavItem = NavItem | (NavGroup & { type: "group" }) | (MegaMenuPanel & { type: "mega" })

// ── Footer Navigation ─────────────────────────────────────────────────────────
export interface FooterNavGroup {
  id: string
  heading: string
  items: NavItem[]
}

// ── Mobile Drawer Nav ─────────────────────────────────────────────────────────
export interface MobileNavItem extends NavItem {
  children?: NavItem[]
}

// ── Category Navigation ───────────────────────────────────────────────────────
export interface CategoryNavItem extends NavItem {
  category: ProductCategory
  description?: string
  image?: string
  itemCount?: number
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}
