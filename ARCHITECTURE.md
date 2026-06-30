# ARCHITECTURE.md — XINVORA System Architecture

> This document is the definitive reference for how the XINVORA codebase is structured, why every folder exists, and how every layer of the application relates to every other layer.
>
> Every AI agent and engineer must read this document before creating or modifying any file.
>
> **DOCUMENTATION STATE: FROZEN. DO NOT EDIT.**

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Layer-by-Layer Architecture](#4-layer-by-layer-architecture)
   - [App Router — `app/`](#41-app-router--app)
   - [Components — `components/`](#42-components--components)
   - [Features — `features/`](#43-features--features)
   - [Library — `lib/`](#44-library--lib)
   - [Services — `services/`](#45-services--services)
   - [Hooks — `hooks/`](#46-hooks--hooks)
   - [Providers — `providers/`](#47-providers--providers)
   - [Types — `types/`](#48-types--types)
   - [Styles — `styles/`](#49-styles--styles)
   - [Public Assets — `public/`](#410-public-assets--public)
   - [Prisma — `prisma/`](#411-prisma--prisma)
   - [Animations — `animations/`](#412-animations--animations)
5. [Rendering Architecture](#5-rendering-architecture)
   - [Server Components](#51-server-components)
   - [Client Components](#52-client-components)
   - [Decision Guide](#53-server-vs-client-decision-guide)
6. [Database Philosophy](#6-database-philosophy)
7. [API Philosophy](#7-api-philosophy)
8. [Naming Conventions](#8-naming-conventions)
9. [Import Conventions](#9-import-conventions)
10. [Data Flow Diagram](#10-data-flow-diagram)

---

## 1. Architecture Principles

These principles guide every technical decision, code review, and development step on the XINVORA platform. They resolve future design debates and align team standards.

*   **Convention over configuration**: We follow the standard configurations and structural structures provided by Next.js and Tailwind. We avoid building custom compilation scripts or configuration layers.
*   **Composition over inheritance**: Build small, focused modules and compose them to construct pages. Avoid creating monolithic classes or tightly coupled object hierarchies.
*   **Explicit over implicit**: Code must reveal its intent immediately. Do not write clever tricks, implicit conversions, or dynamic imports without explicit type safety and code commenting.
*   **Small incremental changes**: Never refactor huge files or multiple features in a single session. Every modification must be small, testable, and isolated.
*   **Performance first**: Loading speeds, Core Web Vitals, and optimal edge delivery are constraints from day one. Do not build features that regress performance metrics.
*   **Accessibility first**: Keyboard interaction, ARIA semantic elements, and correct contrast are constraints during component implementation — never patched on later.

---

## 2. Architecture Philosophy

### Feature-First Architecture

XINVORA uses a **feature-first architecture**. This means that all code related to a specific product domain feature (the shop, the cart, authentication, the user dashboard) is co-located in a single feature folder — rather than being scattered across shared `components/`, `hooks/`, and `utils/` directories by technical type.

**Why feature-first?**

*   A developer working on the Cart feature finds everything they need in `features/cart/`
*   Deleting a feature requires deleting one folder, not hunting through six directories.
*   Features are independently testable and deployable.
*   The codebase scales horizontally without becoming a tangle of cross-feature dependencies.

### Layered Architecture

Within the feature-first structure, a strict layering system is enforced:

```
UI Layer          → components/, features/*/components/
Logic Layer       → features/*/hooks/, features/*/utils/
Service Layer     → services/
Data Layer        → prisma/, services/db/
```

Each layer may only depend on layers below it. The UI layer never directly accesses the data layer.

### Zero Speculative Abstraction

No folder, file, type, or interface is created "for future use." Every piece of code that exists has a current, active purpose. Abstractions are introduced only when the pattern has been repeated at least three times and the abstraction genuinely reduces complexity.

---

## 3. Complete Folder Structure

```
xinvora/
|
+-- app/                              # Application Routing
|   +-- (marketing)/                  # Route group: public marketing pages
|   |   +-- page.tsx                  # Landing page (/)
|   |   +-- about/
|   |   |   +-- page.tsx
|   |   +-- layout.tsx
|   +-- (shop)/                       # Route group: shopping experience
|   |   +-- shop/
|   |   |   +-- page.tsx              # Shop index
|   |   |   +-- [category]/
|   |   |       +-- page.tsx          # Category page
|   |   +-- product/
|   |   |   +-- [slug]/
|   |   |       +-- page.tsx          # Product detail page
|   |   +-- cart/
|   |   |   +-- page.tsx
|   |   +-- checkout/
|   |       +-- page.tsx
|   +-- (auth)/                       # Route group: authentication
|   |   +-- login/
|   |   |   +-- page.tsx
|   |   +-- register/
|   |       +-- page.tsx
|   +-- (dashboard)/                  # Route group: authenticated user area
|   |   +-- dashboard/
|   |       +-- page.tsx
|   |       +-- orders/
|   |       |   +-- page.tsx
|   |       +-- profile/
|   |           +-- page.tsx
|   +-- api/                          # API Route Handlers
|   |   +-- products/
|   |   |   +-- route.ts
|   |   +-- cart/
|   |   |   +-- route.ts
|   |   +-- orders/
|   |   |   +-- route.ts
|   |   +-- auth/
|   |   |   +-- [...nextauth]/
|   |   |       +-- route.ts
|   |   +-- webhooks/
|   |       +-- payments/
|   |           +-- route.ts
|   +-- layout.tsx                    # Root layout
|   +-- error.tsx                     # Root error boundary
|   +-- not-found.tsx                 # 404 page
|   +-- loading.tsx                   # Root loading UI
|
+-- components/                       # Globally reusable UI components
|   +-- ui/                           # Primitive design system components
|   |   +-- Button/
|   |   |   +-- Button.tsx
|   |   |   +-- Button.types.ts
|   |   +-- Input/
|   |   +-- Badge/
|   |   +-- Card/
|   |   +-- Modal/
|   |   +-- Tooltip/
|   |   +-- Skeleton/
|   |   +-- Spinner/
|   +-- shared/                       # Shared structural/layout components
|       +-- Header/
|       +-- Footer/
|       +-- Navigation/
|       +-- Breadcrumbs/
|       +-- PageWrapper/
|       +-- SectionHeading/
|
+-- features/                         # Feature-first domain modules
|   +-- shop/                         # Product listing and filtering
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- utils/
|   |   +-- types.ts
|   +-- product/                      # Product detail and variants
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- utils/
|   |   +-- types.ts
|   +-- cart/                         # Shopping cart
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- store.ts                  # Zustand cart store
|   |   +-- utils.ts
|   |   +-- types.ts
|   +-- checkout/                     # Checkout flow and payment forms
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- utils/
|   |   +-- types.ts
|   +-- auth/                         # Authentication UI and logic
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- types.ts
|   +-- dashboard/                    # User dashboard
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- types.ts
|   +-- orders/                       # Order history and tracking
|       +-- components/
|       +-- hooks/
|       +-- types.ts
|
+-- lib/                              # Core shared utilities and config
|   +-- constants/                    # Application constants
|   |   +-- brand.ts                  # Brand name, tagline, meta defaults
|   |   +-- routes.ts                 # Route path constants
|   |   +-- config.ts                 # App-wide configuration values
|   +-- utils/                        # Pure utility functions
|   |   +-- formatCurrency.ts
|   |   +-- formatDate.ts
|   |   +-- slugify.ts
|   |   +-- cn.ts                     # Tailwind class merge utility
|   +-- validations/                  # Shared validation schemas
|   |   +-- productSchema.ts
|   |   +-- orderSchema.ts
|   |   +-- userSchema.ts
|   +-- auth.ts                       # Auth configuration helper stubs
|   +-- db.ts                         # DB Client singleton instance wrapper
|
+-- services/                         # External service integrations
|   +-- payments/                     # Payment gateway integration files
|   |   +-- client.ts
|   |   +-- checkout.ts
|   |   +-- webhooks.ts
|   +-- storage/                      # Image/Media storage service integrations
|   |   +-- client.ts
|   |   +-- upload.ts
|   |   +-- transform.ts
|   +-- mail/                         # Transactional email service integrations
|   |   +-- client.ts
|   |   +-- templates/
|   |       +-- orderConfirmation.ts
|   |       +-- welcomeEmail.ts
|   +-- db/                           # Database query abstraction layer
|       +-- products.ts               # Product queries
|       +-- orders.ts                 # Order queries
|       +-- users.ts                  # User queries
|
+-- hooks/                            # Global custom React hooks
|   +-- useMediaQuery.ts
|   +-- useScrollPosition.ts
|   +-- useLocalStorage.ts
|   +-- useDebounce.ts
|   +-- useClickOutside.ts
|
+-- providers/                        # React context providers
|   +-- ThemeProvider.tsx             # Dark/light mode
|   +-- AuthProvider.tsx              # Session context
|   +-- QueryProvider.tsx             # TanStack Query client
|   +-- CartProvider.tsx              # Cart context bridge
|
+-- types/                            # Global shared TypeScript types
|   +-- api.ts                        # API response envelopes
|   +-- database.ts                   # Shared DB model types
|   +-- next.ts                       # Next.js augmentations
|   +-- env.d.ts                      # Environment variable types
|
+-- styles/                           # Global CSS and design tokens
|   +-- globals.css                   # Global base styles
|   +-- tokens.css                    # CSS Custom Property design tokens
|   +-- animations.css                # Global keyframe animations
|   +-- typography.css                # Typography system
|
+-- animations/                       # Framer Motion animation definitions
|   +-- variants.ts                   # Shared motion variants
|   +-- transitions.ts                # Reusable transition configs
|   +-- spring.ts                     # Spring physics presets
|
+-- public/                           # Static assets (never processed by webpack)
|   +-- fonts/                        # Self-hosted font files
|   +-- images/                       # Static brand images
|   +-- icons/                        # SVG icon files
|   +-- og/                           # Open Graph images
|
+-- prisma/                           # Database schema and migrations
|   +-- schema.prisma                 # Data model definitions
|   +-- migrations/                   # Migration history
|   +-- seed.ts                       # Database seed script
|
+-- docs/                             # Engineering documentation
    +-- README.md
    +-- AI_RULES.md
    +-- ARCHITECTURE.md
    +-- DEVELOPMENT_WORKFLOW.md
    +-- PROJECT_STATUS.md
    +-- BRAND_GUIDELINES.md
```

---

## 4. Layer-by-Layer Architecture

### 4.1 App Router — `app/`

**Why it exists:** This is the routing directory. It defines every URL in the application through the file system. The App Router is the entry point for all user-facing page rendering and all API routes.

**What belongs here:**
*   `page.tsx` files — renderable pages at their URL
*   `layout.tsx` files — shared UI wrappers for route groups
*   `loading.tsx` files — suspense loading fallbacks
*   `error.tsx` files — error boundary components
*   `not-found.tsx` — 404 handling
*   `api/*/route.ts` — API Route Handlers

**What does NOT belong here:**
*   Business logic
*   Data transformation
*   Reusable components
*   Custom hooks
*   Style definitions

**Route Groups:** Routes are organized into logical groups using parenthetical folders `(group-name)`. These groups do not affect the URL path. They exist solely to share layouts and organize routes logically:
*   `(marketing)` — public pages: landing, about, press
*   `(shop)` — shopping experience: shop, product, cart, checkout
*   `(auth)` — authentication: login, register, password reset
*   `(dashboard)` — authenticated user area: orders, profile, settings

---

### 4.2 Components — `components/`

**Why it exists:** To house UI components that are genuinely reusable across multiple features and pages without belonging to any single feature. These components are domain-agnostic — they do not know about products, carts, or users.

**Sub-folders:**

#### `components/ui/`
Primitive, atomic design system components. These are the building blocks of the entire UI. They are styled, accessible, typed, and generic.

Examples: `Button`, `Input`, `Badge`, `Card`, `Modal`, `Tooltip`, `Skeleton`, `Spinner`, `Tabs`, `Accordion`

Rules for `ui/` components:
*   They accept only generic props (label, variant, size, onClick)
*   They never contain business logic
*   They never import from `features/`
*   They never fetch data
*   They never manage complex state

#### `components/shared/`
Structural components that appear across many pages but carry some layout or structural awareness.

Examples: `Header`, `Footer`, `Navigation`, `Breadcrumbs`, `PageWrapper`, `SectionHeading`, `MetaTags`

Rules for `shared/` components:
*   They may import from `components/ui/`
*   They may access global context (theme, auth session)
*   They do not import from `features/`

---

### 4.3 Features — `features/`

**Why it exists:** This is the heart of the feature-first architecture. Each subfolder represents a distinct product domain with its own components, hooks, types, and utility functions.

**What belongs inside a feature folder:**
*   `components/` — components only used by this feature
*   `hooks/` — React hooks encapsulating this feature's state and logic
*   `utils.ts` or `utils/` — pure utility functions specific to this feature
*   `types.ts` — TypeScript types for this feature's data models
*   `store.ts` — Zustand store (if this feature has client state, e.g., cart)
*   `api.ts` — TanStack Query hooks for this feature's API calls (client-side fetching)

**Feature isolation rule:** A feature component may import from `components/ui/`, `components/shared/`, `lib/`, `hooks/`, `types/`, and `animations/`. It must never import from another feature folder unless there is an explicit, documented cross-feature dependency.

**Current features:**

| Feature | Responsibility |
|---|---|
| `shop` | Product listing, filtering, sorting, search |
| `product` | Product detail view, variant selection, media gallery |
| `cart` | Add/remove items, quantity management, cart totals |
| `checkout` | Checkout flow, address entry, payment gateways |
| `auth` | Login, registration, password management |
| `dashboard` | User account overview, profile management |
| `orders` | Order history, order detail, tracking status |

---

### 4.4 Library — `lib/`

**Why it exists:** To house shared utilities, constants, configuration, and helpers that do not belong to any single feature but are used throughout the application.

**Sub-folders:**

| Folder / File | Purpose |
|---|---|
| `constants/brand.ts` | Brand name, tagline, company details |
| `constants/routes.ts` | All application route paths as typed constants |
| `constants/config.ts` | App-wide feature flags and configuration |
| `utils/formatCurrency.ts` | Currency formatting with locale support |
| `utils/formatDate.ts` | Date formatting utilities |
| `utils/slugify.ts` | String to URL slug conversion |
| `utils/cn.ts` | Tailwind class merging (clsx + tailwind-merge) |
| `validations/` | Shared Zod schemas for API inputs |
| `auth.ts` | Auth configurations and session utilities |
| `db.ts` | DB client singleton (instantiated once per server process) |

**Rule:** `lib/` contains only pure utilities and configuration. It never contains React components, hooks, or Zustand stores.

---

### 4.5 Services — `services/`

**Why it exists:** To encapsulate all interactions with external systems and to implement database access logic. Services are the only place where external SDK clients are instantiated and called.

**Why a dedicated service layer:**
*   Components never need to know how the external API handles calls.
*   If we switch providers, we change only the files inside that specific subservice (e.g. `services/payments/`).
*   Services are testable in isolation without rendering React components.
*   Services enforce a consistent interface between the application and external dependencies.

**Sub-folders:**

| Folder | External System | Responsibility |
|---|---|---|
| `services/payments/` | Payment Gateway | Client initialization, checkout session generation, webhook validation |
| `services/storage/` | Media Storage | Image upload, optimization transformations, asset queries |
| `services/mail/` | Transactional Email | Template mapping, message dispatching |
| `services/db/` | Database Client | All database queries and mutation methods |

**Rule:** API Route Handlers call service functions. Service functions call external SDKs and database client models. Components never call external SDKs.

---

### 4.6 Hooks — `hooks/`

**Why it exists:** To house custom React hooks that are globally reusable — not tied to any specific feature or component.

These hooks are concerned with browser behavior, device state, and interaction patterns, not business logic.

| Hook | Purpose |
|---|---|
| `useMediaQuery` | Reactive breakpoint detection |
| `useScrollPosition` | Track scroll position for animations and sticky elements |
| `useLocalStorage` | Type-safe localStorage with SSR safety |
| `useDebounce` | Delay state updates for search inputs and resizes |
| `useClickOutside` | Detect clicks outside a referenced element (for dropdowns, modals) |

**Rule:** Hooks in `hooks/` must be generic and business-logic-free. Feature-specific hooks live inside `features/<feature>/hooks/`.

---

### 4.7 Providers — `providers/`

**Why it exists:** To house React context providers that wrap the application and make global state available throughout the component tree.

| Provider | Purpose |
|---|---|
| `ThemeProvider` | Manages dark/light mode preference, applies theme class to `<html>` |
| `AuthProvider` | Wraps authentication session context for client components |
| `QueryProvider` | Creates and provides the TanStack Query client instance |
| `CartProvider` | Bridges the Zustand cart store to React context where needed |

**Rule:** Providers are registered in the root `app/layout.tsx`. They are never nested in feature components or page files.

---

### 4.8 Types — `types/`

**Why it exists:** To house TypeScript type definitions that are shared across multiple features and layers and do not belong to any single feature.

| File | Contents |
|---|---|
| `api.ts` | Standard API response envelope types (`ApiSuccess<T>`, `ApiError`) |
| `database.ts` | Shared database model type re-exports from ORM |
| `next.ts` | Augmentation of Next.js types (custom metadata, page props) |
| `env.d.ts` | TypeScript declarations for `process.env` environment variables |

**Rule:** Feature-specific types live inside `features/<feature>/types.ts`. `types/` is for truly shared, cross-cutting types only.

---

### 4.9 Styles — `styles/`

**Why it exists:** To house the global CSS foundation: the design token system, base resets, typography scale, and keyframe animation definitions.

| File | Contents |
|---|---|
| `globals.css` | CSS reset, base element styles, `@font-face` declarations |
| `tokens.css` | All CSS Custom Properties (design tokens): colors, spacing, radii, shadows, durations |
| `animations.css` | Global `@keyframes` definitions for complex animations |
| `typography.css` | Typographic scale, font weight utilities, line-height system |

**Rule:** No component may define colors, spacing, or type sizes with raw values. All visual properties reference tokens from `tokens.css`.

---

### 4.10 Public Assets — `public/`

**Why it exists:** To serve static files that are referenced by URL and never processed by the build compiler.

| Folder | Contents |
|---|---|
| `public/fonts/` | Self-hosted variable font files (.woff2) |
| `public/images/` | Static brand images that don't require dynamic optimization |
| `public/icons/` | SVG sprite sheets and standalone icon files |
| `public/og/` | Pre-generated Open Graph images for social sharing |

**Rule:** Product images, category images, and user-uploaded content are hosted on the cloud storage service — not in `public/`. This folder is for brand and structural assets only.

---

### 4.11 Prisma — `prisma/`

**Why it exists:** To house data modeling schemas and migration histories. The schema file here operates as the schema template for whichever database ORM or mapping library is approved in `DECISIONS.md`.

| File | Contents |
|---|---|
| `schema.prisma` | The complete database model definitions and relations |
| `migrations/` | Database table structures and execution history |
| `seed.ts` | Script to populate the database with initial development data |

---

### 4.12 Animations — `animations/`

**Why it exists:** To centralize Framer Motion animation definitions so that animation behavior is consistent across the entire application and changes can be made globally.

| File | Contents |
|---|---|
| `variants.ts` | Named Framer Motion variant objects (fadeIn, slideUp, staggerChildren, etc.) |
| `transitions.ts` | Reusable transition configuration objects (duration, easing) |
| `spring.ts` | Spring physics presets for different interaction feels (snappy, gentle, bouncy) |

**Rule:** Components import animation definitions from `animations/`. They never define animation variants inline inside component files.

---

## 5. Rendering Architecture

### 5.1 Server Components

Server Components run exclusively on the server. They are the default in the Next.js App Router.

**What Server Components can do:**
*   Fetch data directly from the database query wrapper layer in `services/db/`
*   Access environment variables and server-only secrets
*   Read cookies and headers
*   Render static or dynamic HTML sent to the client
*   Import server-only libraries

**What Server Components cannot do:**
*   Use React hooks (`useState`, `useEffect`, `useRef`, etc.)
*   Add event listeners (`onClick`, `onChange`, etc.)
*   Access browser APIs (`window`, `document`, `localStorage`)

**Why we prefer Server Components:** They eliminate the client-server data-fetch round trip, reduce JavaScript bundle size, and improve SEO by delivering fully rendered HTML.

---

### 5.2 Client Components

Client Components are declared with the `'use client'` directive at the top of the file. They render on both the server (for initial HTML) and the client (for hydration and interactivity).

**When to use Client Components:**
*   The component uses React hooks (`useState`, `useEffect`, `useRef`)
*   The component responds to user events.
*   The component uses browser APIs.
*   The component uses a client-side library (Framer Motion, Zustand)

**Minimize client surface area:** Wrap only the interactive part of a UI in a Client Component. The parent layout and non-interactive siblings remain Server Components.

---

### 5.3 Server vs. Client Decision Guide

| Requirement | Server Component | Client Component |
|---|---|---|
| Fetch from database | Yes | No |
| Display static content | Yes | Yes |
| Add onClick handler | No | Yes |
| Use useState | No | Yes |
| Use useEffect | No | Yes |
| Access environment variables | Yes | No (only public vars) |
| Use Framer Motion | No | Yes |
| Use Zustand store | No | Yes |
| Access cookies/headers | Yes | Via API |

---

## 6. Database Philosophy

### Schema Design Principles

1.  **Normalized by default.** Data is stored once. Duplication in the database creates synchronization bugs.
2.  **Soft deletes.** Records are never hard-deleted. Every model that represents user or business data has a `deletedAt` timestamp field. This preserves historical integrity.
3.  **Audit timestamps.** Every model has `createdAt` and `updatedAt` timestamps.
4.  **UUID primary keys.** Public-facing identifiers use UUIDs, not auto-increment integers. This prevents enumeration attacks and leaks of business metrics.
5.  **Slugs for URLs.** Content entities (products, categories) have a unique `slug` field used in URLs. The slug is derived from the name and is immutable once published.

### Access Pattern

```
Route Handler  →  Service Function  →  Database Client  →  Engine Instance
```

No component, hook, or provider accesses the database directly.

---

## 7. API Philosophy

### Route Structure

All API routes live under `app/api/` and follow the REST convention:

| Method | Path | Action |
|---|---|---|
| GET | `/api/products` | List products |
| GET | `/api/products/[id]` | Get one product |
| POST | `/api/products` | Create a product |
| PATCH | `/api/products/[id]` | Update a product |
| DELETE | `/api/products/[id]` | Soft-delete a product |

### Response Envelope

All API responses follow a standard envelope:

**Success:**
```json
{
  "success": true,
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "No product found with this ID."
  }
}
```

### API Responsibilities

Each Route Handler is responsible for:
1.  Authenticating the request (when required)
2.  Validating the input with a Zod schema
3.  Calling the appropriate service function
4.  Returning the standard response envelope

Route Handlers contain no business logic. Business logic lives in service functions.

---

## 8. Naming Conventions

### Files and Folders

| Type | Convention | Example |
|---|---|---|
| React Component | PascalCase | `ProductCard.tsx` |
| Component folder | PascalCase | `ProductCard/` |
| Hook file | camelCase, `use` prefix | `useCartState.ts` |
| Utility file | camelCase | `formatCurrency.ts` |
| Type file | camelCase | `types.ts` or `product.types.ts` |
| Constants file | camelCase | `brandConstants.ts` |
| API route | kebab-case dir | `product-details/route.ts` |
| Service file | camelCase | `checkout.ts` |
| DB migration | Auto-generated | `20260101_add_product_slug` |
| CSS file | kebab-case | `tokens.css`, `globals.css` |

### Code Symbols

| Symbol | Convention | Example |
|---|---|---|
| React Component | PascalCase | `ProductCard` |
| TypeScript Interface | PascalCase | `Product`, `IProductCardProps` |
| TypeScript Type | PascalCase | `ProductVariant` |
| Zod Schema | camelCase, `Schema` suffix | `productSchema` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Function | camelCase | `formatCurrency` |
| CSS Custom Property | kebab-case with namespace | `--color-brand-primary` |
| Zustand Store | camelCase, `Store` suffix | `useCartStore` |

---

## 9. Import Conventions

### Path Aliases

All imports use TypeScript path aliases, never relative paths that traverse up multiple levels.

| Alias | Resolves To | Example |
|---|---|---|
| `@/components` | `./components` | `import { Button } from '@/components/ui/Button'` |
| `@/features` | `./features` | `import { useCart } from '@/features/cart/hooks'` |
| `@/lib` | `./lib` | `import { cn } from '@/lib/utils/cn'` |
| `@/services` | `./services` | `import { checkout } from '@/services/payments/checkout'` |
| `@/hooks` | `./hooks` | `import { useDebounce } from '@/hooks/useDebounce'` |
| `@/types` | `./types` | `import type { ApiSuccess } from '@/types/api'` |
| `@/styles` | `./styles` | Only used in `globals.css` imports |
| `@/animations` | `./animations` | `import { fadeIn } from '@/animations/variants'` |

### Import Order

All files follow this import order, enforced by ESLint:

1.  React and Next.js core imports
2.  Third-party library imports
3.  Internal path alias imports (`@/`)
4.  Relative imports (same folder only)
5.  Type-only imports (`import type`)

---

## 10. Data Flow Diagram

```
User Interaction
      |
      v
Client Component  (onClick, onChange, form submit)
      |
      v
Zustand Action / TanStack Query mutation
      |
      v
API Route Handler  (app/api/*/route.ts)
      |         |
      |         v
      |    Validation Schema  (lib/validations/)
      |         |
      v         v
Service Function  (services/db/ or services/payments/ etc.)
      |
      v
Database ORM Layer  (lib/db.ts singleton)
      |
      v
Database Engine
```

**Read path (Server Component):**
```
Page Request
      |
      v
Server Component (app/**/page.tsx)
      |
      v
Service Function (services/db/)
      |
      v
Database ORM Layer
      |
      v
Database Engine → Data returned → HTML rendered → Sent to browser
```

---

*XINVORA ARCHITECTURE.md — v1.1.0*
*Established: 2026*
