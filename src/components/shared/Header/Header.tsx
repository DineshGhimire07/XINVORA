"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [liveCartCount, setLiveCartCount] = React.useState(cartCount)
  const [liveWishlistCount, setLiveWishlistCount] = React.useState(wishlistCount)

  React.useEffect(() => {
    let cancelled = false

    const fetchSummary = () => {
      fetch("/api/cart/summary")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) {
            setLiveCartCount(data.cartCount ?? 0)
            setLiveWishlistCount(data.wishlistCount ?? 0)
          }
        })
        .catch(() => {
          // Silently ignore — badge just stays at its current value
        })
    }

    // Fetch once on initial site load to populate the counts
    fetchSummary()

    // Listen for mutations or window focus to update counts dynamically
    window.addEventListener("cart-updated", fetchSummary)
    window.addEventListener("focus", fetchSummary)

    return () => {
      cancelled = true
      window.removeEventListener("cart-updated", fetchSummary)
      window.removeEventListener("focus", fetchSummary)
    }
  }, [])

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeAccordion, setActiveAccordion] = React.useState<string | null>(null)
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

  // Track scroll position to transition header from transparent to solid white
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isHomepage = pathname === "/"

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
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out h-[72px] md:h-20 flex items-center border-b",
        isScrolled || !isHomepage
          ? "bg-white text-text-primary border-neutral-100"
          : "bg-transparent text-white border-transparent"
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-12 md:px-16 lg:px-20 w-full h-full relative">
        
        {/* LEFT NAV */}
        <nav className="hidden md:flex items-center gap-10 h-full">
          {/* SHOP LINK */}
          <Link
            href="/search"
            prefetch={false}
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Shop
          </Link>

          {/* COLLECTIONS LINK */}
          <Link
            href="/collections"
            prefetch={false}
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Collections
          </Link>

          {/* LIVING LINK */}
          <Link
            href="/collections/home-decor"
            prefetch={false}
            className="text-[13px] font-medium tracking-[0.18em] uppercase hover:opacity-60 transition-opacity duration-200 py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-text-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
          >
            Living
          </Link>

          {/* JOURNAL LINK */}
          <Link
            href="/journal"
            prefetch={false}
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
            prefetch={false}
            className="hidden md:flex p-1 hover:opacity-60 transition-opacity duration-200 mr-1 sm:mr-3 md:mr-7"
            aria-label="Search items"
          >
            <Search className="w-4.5 h-4.5 stroke-[1.25]" />
          </Link>

          <Link
            href="/wishlist"
            prefetch={false}
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
              prefetch={false}
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
              prefetch={false}
              className="p-1 hover:opacity-60 transition-opacity duration-200"
              aria-label="Your account"
            >
              <User className="w-4.5 h-4.5 stroke-[1.25]" />
            </Link>
          </div>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div ref={drawerRef} className="fixed inset-0 z-[100] bg-surface text-text-primary flex flex-col animate-fade-in md:hidden">
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-border">
            <span className="text-display-sm font-display tracking-[0.2em] uppercase">XINVORA</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:opacity-60 transition-opacity"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 stroke-[1.25]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <nav className="flex flex-col gap-6">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide uppercase py-1 border-b border-border/40"
              >
                Home
              </Link>

              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide uppercase border-b border-border/40 pb-3"
              >
                Shop
              </Link>

              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide uppercase border-b border-border/40 pb-3"
              >
                Collections
              </Link>

              <Link
                href="/collections/home-decor"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide uppercase border-b border-border/40 pb-3"
              >
                Living
              </Link>

              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium tracking-wide uppercase border-b border-border/40 pb-3"
              >
                Journal
              </Link>
            </nav>

            <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4 text-text-secondary">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-body-sm uppercase tracking-wider"
              >
                <Search className="w-4 h-4" /> Search
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-body-sm uppercase tracking-wider"
              >
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-body-sm uppercase tracking-wider"
              >
                <User className="w-4 h-4" /> Account
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-body-sm uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" /> Cart ({liveCartCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
