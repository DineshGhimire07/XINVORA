/**
 * constants/navigation.ts — XINVORA Navigation Data
 *
 * All navigation structure lives here as data — not inside components.
 * This separation makes nav changes a data edit, not a component edit.
 *
 * Main nav, footer groups, mobile nav, and utility links.
 */

import type { NavItem, FooterNavGroup, MobileNavItem } from "@/types/navigation"

// ── Main Navigation ───────────────────────────────────────────────────────────
// Desktop navbar items — kept intentionally minimal (premium brands don't clutter)
export const MAIN_NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/shop" },
  { id: "collections", label: "Collections", href: "/collections" },
  { id: "journal", label: "Journal", href: "/journal" },
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const

// ── Mobile Navigation ─────────────────────────────────────────────────────────
// Mirrors main nav — extended with nested items when categories grow
export const MOBILE_NAV: MobileNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/shop" },
  { id: "collections", label: "Collections", href: "/collections" },
  { id: "journal", label: "Journal", href: "/journal" },
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const

// ── Footer Navigation Groups ──────────────────────────────────────────────────
export const FOOTER_NAV: FooterNavGroup[] = [
  {
    id: "company",
    heading: "Company",
    items: [
      { id: "about", label: "About Us", href: "/about" },
      { id: "journal", label: "Journal", href: "/journal" },
      { id: "careers", label: "Careers", href: "/careers" },
      { id: "press", label: "Press", href: "/press" },
    ],
  },
  {
    id: "shop",
    heading: "Shop",
    items: [
      { id: "new", label: "New Arrivals", href: "/new" },
      { id: "collections", label: "Collections", href: "/collections" },
      { id: "bestsellers", label: "Best Sellers", href: "/bestsellers" },
      { id: "sale", label: "Sale", href: "/sale" },
    ],
  },
  {
    id: "support",
    heading: "Customer Service",
    items: [
      { id: "faq", label: "FAQ", href: "/faq" },
      { id: "shipping", label: "Shipping", href: "/shipping" },
      { id: "returns", label: "Returns", href: "/returns" },
      { id: "contact", label: "Contact Us", href: "/contact" },
    ],
  },
  {
    id: "legal",
    heading: "Policies",
    items: [
      { id: "privacy", label: "Privacy Policy", href: "/privacy" },
      { id: "terms", label: "Terms of Service", href: "/terms" },
      { id: "cookies", label: "Cookie Policy", href: "/cookies" },
      { id: "accessibility", label: "Accessibility", href: "/accessibility" },
    ],
  },
] as const

// ── Utility Nav (right side of navbar) ───────────────────────────────────────
export const UTILITY_NAV: NavItem[] = [
  { id: "search", label: "Search", href: "/search" },
  { id: "wishlist", label: "Wishlist", href: "/wishlist" },
  { id: "cart", label: "Cart", href: "/cart" },
  { id: "account", label: "Account", href: "/account" },
] as const
