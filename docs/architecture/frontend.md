# Frontend Architecture & UI System

## Stack
- **Framework**: Next.js 16 App Router
- **UI Library**: React 19 Client & Server Components
- **Styling**: Tailwind CSS v4, Framer Motion micro-animations
- **Icons**: Lucide React

---

## Component Architecture

```text
src/components/
├── admin/          # Admin CMS UI, Stat Cards, Charts, Layout
├── auth/           # Shared Luxury Split Auth Layout (<AuthLayout>)
├── cookies/        # CookieProvider, CookieScriptLoader, CookieBanner, CookieModal
├── shared/         # Header, Footer, Container, Section, Grid, Stack
├── shop/           # HeroSlider, MaintenancePage
├── storefront/     # ProductCard, LookProductCard, VariantSelector, Recommendations
└── ui/             # shadcn/ui Base Primitives (Button, Input, Label, Dialog)
```

---

## Responsive Design System
- **Breakpoint Standards**: Mobile (`< 640px`), Tablet (`640px - 1024px`), Desktop (`> 1024px`).
- **Touch Optimizations**: `-webkit-overflow-scrolling: touch`, `touch-action: pan-y` on carousels.
- **Scroll Restoration**: Client-side `<ScrollToTop />` attached to route changes.

---

**Last Updated**: July 20, 2026
