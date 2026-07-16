"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHeaderState } from "@/providers/header-state-provider"

interface HeaderProps {
  cartCount?: number
  wishlistCount?: number
  collections?: { id: string; name: string; slug: string }[]
}

const shopMegaMenu = {
  MEN: [
    { name: "Shirts", href: "/search?category=shirts&gender=men" },
    { name: "T-Shirts", href: "/search?category=t-shirts&gender=men" },
    { name: "Polos", href: "/search?category=polos&gender=men" },
    { name: "Sweatshirts", href: "/search?category=sweatshirts&gender=men" },
    { name: "Hoodies", href: "/search?category=hoodies&gender=men" },
    { name: "Jackets", href: "/search?category=jackets&gender=men" },
    { name: "Outerwear", href: "/search?category=outerwear&gender=men" },
    { name: "Pants", href: "/search?category=pants&gender=men" },
    { name: "Jeans", href: "/search?category=jeans&gender=men" },
    { name: "Shorts", href: "/search?category=shorts&gender=men" },
    { name: "Accessories", href: "/search?category=accessories&gender=men" },
  ],
  WOMEN: [
    { name: "Dresses", href: "/search?category=dresses&gender=women" },
    { name: "Tops", href: "/search?category=tops&gender=women" },
    { name: "Shirts", href: "/search?category=shirts&gender=women" },
    { name: "Sweaters", href: "/search?category=sweaters&gender=women" },
    { name: "Outerwear", href: "/search?category=outerwear&gender=women" },
    { name: "Pants", href: "/search?category=pants&gender=women" },
    { name: "Skirts", href: "/search?category=skirts&gender=women" },
    { name: "Bags", href: "/search?category=bags&gender=women" },
    { name: "Accessories", href: "/search?category=accessories&gender=women" },
  ],
  "HOME LIVING": [
    { name: "Decor", href: "/collections/home-decor" },
    { name: "Kitchen", href: "/collections/kitchen-essentials" },
    { name: "Dining", href: "/collections/dining" },
    { name: "Lighting", href: "/collections/lighting" },
    { name: "Bathroom", href: "/collections/bathroom" },
    { name: "Storage", href: "/collections/storage" },
    { name: "Office", href: "/collections/office-setup" },
    { name: "Wall Art", href: "/collections/wall-decor" },
    { name: "Candles", href: "/search?category=candles" },
    { name: "Textiles", href: "/search?category=textiles" },
    { name: "Furniture", href: "/search?category=furniture" },
  ],
  FEATURED: [
    { name: "New Arrivals", href: "/search?sort=newest" },
    { name: "Best Sellers", href: "/search?sort=best-sellers" },
    { name: "Editor's Picks", href: "/search?featured=true" },
    { name: "Summer Collection", href: "/collections/summer" },
    { name: "Gift Guide", href: "/collections/gifts" },
  ],
}

const collectionsList = [
  { name: "Summer Collection", slug: "summer" },
  { name: "Autumn Collection", slug: "autumn" },
  { name: "Minimal Living", slug: "minimal-living" },
  { name: "Modern Workspace", slug: "modern-workspace" },
  { name: "Scandinavian Home", slug: "scandinavian-home" },
  { name: "Travel Essentials", slug: "travel-essentials" },
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Limited Edition", slug: "limited-edition" },
]

const journalList = [
  { name: "Editorials", href: "/journal?tag=editorials" },
  { name: "Design Stories", href: "/journal?tag=design-stories" },
  { name: "Care Guides", href: "/journal?tag=care-guides" },
  { name: "Behind the Collection", href: "/journal?tag=behind-the-collection" },
  { name: "Lifestyle", href: "/journal?tag=lifestyle" },
]

export function Header({ cartCount = 0, wishlistCount = 0, collections = [] }: HeaderProps) {
  const pathname = usePathname()
  const isHomepage = pathname === "/"
  const { state } = useHeaderState()

  const liveCartCount = state.cart ? state.cart.cartCount : cartCount
  const liveWishlistCount = state.cart ? state.cart.wishlistCount : wishlistCount

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const drawerRef = React.useRef<HTMLDivElement>(null)

  // Body scroll lock on mobile menu toggle
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Focus trap on mobile menu open
  React.useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const container = drawerRef.current
      if (!container) return

      const focusables = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }

    // Auto-focus the close button inside the drawer on open
    const container = drawerRef.current
    if (container) {
      const closeBtn = container.querySelector<HTMLElement>('button[aria-label="Close menu"]')
      closeBtn?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileMenuOpen])

  // No scroll listener needed — backdrop-blur naturally picks up color from page content behind the navbar

  // Merge static menu items with database collections dynamically
  const mergedCollections = React.useMemo(() => {
    const list = [...collectionsList]
    for (const c of collections) {
      if (!list.some((item) => item.slug === c.slug)) {
        list.push({ name: c.name, slug: c.slug })
      }
    }
    return list
  }, [collections])

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 h-[56px] md:h-[64px] flex items-center border-b bg-transparent backdrop-blur-[2px] text-text-primary border-transparent"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 md:px-8 lg:px-10 w-full h-full relative">
        
        {/* LEFT NAV */}
        <nav className="hidden md:flex items-center gap-10 h-full">
          {/* SHOP LINK */}
          <Link
            href="/search"
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Shop
          </Link>

          {/* COLLECTIONS LINK */}
          <Link
            href="/collections"
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Collections
          </Link>

          {/* LIVING LINK */}
          <Link
            href="/collections/home-decor"
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Living
          </Link>

          {/* JOURNAL LINK */}
          <Link
            href="/journal"
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Journal
          </Link>
        </nav>

        {/* MOBILE MENU TRIGGER */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-start py-2 text-current hover:opacity-60 transition-opacity"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5.5 h-5.5 stroke-[1.25]" />
        </button>

        {/* CENTER LOGO */}
        <div className="justify-self-center">
          <Link
            href="/"
            className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.65rem] font-display font-light tracking-[0.25em] uppercase text-current hover:opacity-85 transition-opacity"
            aria-label="XINVORA Home"
          >
            XINVORA
          </Link>
        </div>

        {/* RIGHT UTILITIES */}
        <div className="justify-self-stretch md:justify-self-end flex items-center justify-between md:justify-start w-full md:w-auto text-current pl-1 sm:pl-2 md:pl-0">
          <Link
            href="/search"
            className="hidden md:flex p-1 hover:opacity-60 transition-opacity duration-200 mr-1 sm:mr-3 md:mr-7"
            aria-label="Search items"
          >
            <Search className="w-4.5 h-4.5 stroke-[1.25]" />
          </Link>

          <Link
            href="/wishlist"
            className="p-1 hover:opacity-60 transition-opacity duration-200 relative"
            aria-label="Your wishlist"
          >
            <Heart className="w-4.5 h-4.5 stroke-[1.25]" />
            {liveWishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-text-primary rounded-full" />
            )}
          </Link>

          {/* Cart and Account group */}
          <div className="flex items-center gap-1 md:gap-7 md:ml-7">
            <Link
              href="/cart"
              className="p-1 hover:opacity-60 transition-opacity duration-200 relative flex items-center"
              aria-label="Your shopping cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.25]" />
              {liveCartCount > 0 && (
                <span className="ml-1 text-[10px] font-medium tracking-wide">
                  ({liveCartCount})
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="p-1 hover:opacity-60 transition-opacity duration-200"
              aria-label="Your account"
            >
              <User className="w-4.5 h-4.5 stroke-[1.25]" />
            </Link>
          </div>
        </div>

      </div>

      {/* MOBILE DRAWER — COS style full-screen white panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-0 z-[200] md:hidden flex flex-col bg-white text-black h-screen",
          "transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!mobileMenuOpen}
      >
        {/* TOP BAR: logo + icons */}
        <div className="h-[56px] flex items-center justify-between px-5 border-b border-neutral-100 flex-shrink-0">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[15px] font-semibold tracking-[0.3em] uppercase"
          >
            XINVORA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} aria-label="Search">
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} aria-label="Account" className="relative">
              <User className="w-[18px] h-[18px] stroke-[1.5]" />
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} aria-label="Cart" className="relative">
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
              {liveCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-black rounded-full" />
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="hover:opacity-50 transition-opacity"
              aria-label="Close menu"
            >
              <X className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* SHOP — plain link */}
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-5 py-5 border-b border-neutral-100 text-[15px] font-semibold tracking-[0.06em] uppercase hover:opacity-60 transition-opacity"
          >
            Shop
          </Link>

          {/* COLLECTIONS — plain link */}
          <Link
            href="/collections"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-5 py-5 border-b border-neutral-100 text-[15px] font-semibold tracking-[0.06em] uppercase hover:opacity-60 transition-opacity"
          >
            Collections
          </Link>


          {/* LIVING — plain link */}
          <Link
            href="/collections/home-decor"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-5 py-5 border-b border-neutral-100 text-[15px] font-semibold tracking-[0.06em] uppercase hover:opacity-60 transition-opacity"
          >
            Living
          </Link>

          {/* JOURNAL — plain link */}
          <Link
            href="/journal"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-5 py-5 border-b border-neutral-100 text-[15px] font-semibold tracking-[0.06em] uppercase hover:opacity-60 transition-opacity"
          >
            Journal
          </Link>

          {/* UTILITY LINKS */}
          <div className="px-5 pt-6 pb-10 flex flex-col gap-4">
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[13px] tracking-[0.1em] uppercase text-neutral-500 hover:text-black transition-colors"
            >
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-[13px] tracking-[0.1em] uppercase text-neutral-500 hover:text-black transition-colors"
            >
              <User className="w-4 h-4" /> Account
            </Link>
          </div>

        </div>
      </div>

      {/* OVERLAY BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[199] bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
