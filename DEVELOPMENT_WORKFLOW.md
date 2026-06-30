# DEVELOPMENT_WORKFLOW.md — XINVORA Phase-by-Phase Roadmap

> This document defines the complete development roadmap for XINVORA.
>
> **Every AI agent must read PROJECT_STATUS.md first, then return to this document to understand the scope of the current active phase.**
>
> Phases are sequential and non-negotiable. Phase N cannot begin until Phase N-1 is fully complete, all checklist items in PROJECT_STATUS.md have been verified, and the corresponding Phase Quality Gate has passed.
>
> **DOCUMENTATION STATE: FROZEN. DO NOT EDIT.**

---

## Roadmap Overview

```
Phase 1    Project Foundation
   |
Phase 2A   Application Shell
   |
Phase 2B   Design System
   |
Phase 2C   Navigation
   |
Phase 2D   Motion System
   |
Phase 3    Landing Page
   |
Phase 4    Shop (Product Listing)
   |
Phase 5    Product Detail
   |
Phase 6    Cart
   |
Phase 7    Authentication
   |
Phase 8    User Dashboard
   |
Phase 9    Database Integration
   |
Phase 10   Backend API
   |
Phase 11   Image Upload
   |
Phase 12   Inventory Management
   |
Phase 13   Order Management
   |
Phase 14   Payments Integration
   |
Phase 15   Deployment
```

---

## Git Workflow Rules

Before any coding begins in Phase 1:
```bash
git init
```

At the completion of **every single phase**, once all Quality Gate checks pass:
```bash
git add .
git commit -m "Phase [Number][Letter] Complete"
```
Each phase must correspond to exactly one clean commit containing only the code generated for that phase.

---

## Standard Quality Gate Checks

A phase is not officially complete until the following Quality Gate commands run and exit with zero errors or warnings:

1. **Lint Check**: Run project linters to check code compliance (`npm run lint` or equivalent).
2. **Build Check**: Compile the production bundle locally (`npm run build` or equivalent) to verify imports and static pages.
3. **Execution Check**: Verify that the development server (`npm run dev` or equivalent) boots without warnings or errors.
4. **TypeScript Check**: Run typescript compiler check (`npx tsc --noEmit` or equivalent) to verify strict type safety.
5. **Documentation Check**: Verify that [PROJECT_STATUS.md](./PROJECT_STATUS.md) and [CHANGELOG.md](./CHANGELOG.md) have been updated.
6. **Git Commit**: Commit all files with a structured commit message.

---

## Phase 1 — Project Foundation

**Goal:** Establish the project repository, tooling configuration, and documentation infrastructure. No application code is written in this phase.

### What Belongs in Phase 1
*   Initialize Git repository.
*   Create Web Application project with TypeScript and App Router.
*   Configure `tsconfig.json` with strict mode and path aliases.
*   Configure ESLint with project-specific rules (import order, no-any, etc.).
*   Configure Prettier with formatting standards.
*   Install and configure Styling Framework.
*   Install core dependencies (Animation library, client-state library, server-state query library, validation library, form controller library, icon family).
*   Configure environment variable types in `types/env.d.ts`.
*   Set up `.env.local.example` with all required variable names (no values).
*   Create the complete folder structure as defined in ARCHITECTURE.md (empty folders with `.gitkeep`).
*   Create documentation files.
*   Configure next.config.js with image domains, headers, and redirects.
*   Verify development server starts successfully with no errors.

### What Does NOT Belong in Phase 1
*   Any page content or layout.
*   Any UI components.
*   Any design tokens or CSS.
*   Any database schema.
*   Any API routes.
*   Any business logic.
*   Any external service integrations.

### Quality Gate Phase 1
- [ ] Run `npm run lint` (or config equivalent) -> exit code 0.
- [ ] Run typescript checks (`npx tsc --noEmit` or equivalent) -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 1 Complete"`.

---

## Phase 2A — Application Shell

**Goal:** Create the bare structural shell of the application — root layout, root error boundary, 404 page, and loading state. No visual design yet.

### What Belongs in Phase 2A
*   Create `app/layout.tsx` — root layout with structural wrappers.
*   Create `app/error.tsx` — root error boundary component.
*   Create `app/not-found.tsx` — 404 page component.
*   Create `app/loading.tsx` — root loading fallback.
*   Create provider files (QueryProvider, ThemeProvider stubs) and register them.
*   Configure global SEO metadata in the root layout.
*   Confirm the app renders without runtime errors.

### What Does NOT Belong in Phase 2A
*   Any visual styling beyond functional structure.
*   Any actual page content.
*   Navigation components.
*   Design tokens or animations.

### Quality Gate Phase 2A
- [ ] Run `npm run lint` -> exit code 0.
- [ ] Run typescript checks -> exit code 0.
- [ ] Verify pages load on localhost dev server with no console errors.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 2A Complete"`.

---

## Phase 2B — Design System

**Goal:** Build the complete visual foundation — design tokens, global styles, typography, and all primitive UI components. This phase determines the entire visual language of the platform.

### What Belongs in Phase 2B
*   Define all CSS Custom Property tokens in `styles/tokens.css` (Colors, Spacing, Typography, Shadows, etc.).
*   Configure styling utility to reference design tokens.
*   Write `styles/globals.css` and `styles/typography.css` (resets, variable fonts).
*   Build primitive UI components in `components/ui/` (Button, Input, Badge, Card, Skeleton, Spinner, Separator, Tooltip).
*   Verify all components render in all variants (primary, secondary, etc.).
*   Verify dark mode works correctly for all components.

### What Does NOT Belong in Phase 2B
*   Navigation or header.
*   Any page layouts.
*   Feature-specific components.
*   Animations.
*   Any backend integration.

### Quality Gate Phase 2B
- [ ] Run UI components through visual check (light and dark mode).
- [ ] Run `npm run lint` -> exit code 0.
- [ ] Run typescript checks -> exit code 0.
- [ ] Run build command to confirm compile checks -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 2B Complete"`.

---

## Phase 2C — Navigation

**Goal:** Build the site navigation — header, footer, and mobile menu — using the design system built in Phase 2B.

### What Belongs in Phase 2C
*   Build `components/shared/Header/` — desktop navigation.
*   Build `components/shared/Footer/` — brand footer.
*   Build mobile navigation drawer/menu.
*   Build `components/shared/Breadcrumbs/`.
*   Create route constants in `lib/constants/routes.ts`.
*   Integrate Header and Footer into the root layout.
*   Implement navigation active state based on current route.
*   Implement skip-to-content accessibility link.
*   Verify keyboard navigation works completely.

### What Does NOT Belong in Phase 2C
*   Page-specific header variations.
*   Cart icon with item count.
*   User account session checks.

### Quality Gate Phase 2C
- [ ] Run `npm run lint` -> exit code 0.
- [ ] Run typescript checks -> exit code 0.
- [ ] Verify accessibility compliance (tab indexing, aria states for menu).
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 2C Complete"`.

---

## Phase 2D — Motion System

**Goal:** Define and implement the complete animation and motion foundation using Framer Motion. Establish reusable animation variants, transitions, and spring presets.

### What Belongs in Phase 2D
*   Define animation token values in `styles/tokens.css` (durations, easing curves).
*   Build `animations/variants.ts` (fadeIn, slideUp, stagger, etc.).
*   Build `animations/transitions.ts` and `animations/spring.ts` physics profiles.
*   Create `components/ui/AnimatedWrapper/` motion utility.
*   Apply page transition animation to the root layout.
*   Verify animations respect the `prefers-reduced-motion` media query.

### What Does NOT Belong in Phase 2D
*   Page-specific animations.
*   Scroll-triggered custom canvas renders.

### Quality Gate Phase 2D
- [ ] Verify page transition animation works.
- [ ] Check console outputs for animation/hydration warnings.
- [ ] Run typescript compiler and lint check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 2D Complete"`.

---

## Phase 3 — Landing Page

**Goal:** Build the landing page — the primary marketing surface that communicates brand identity, value proposition, and drives visitors toward the shop.

### What Belongs in Phase 3
*   Build `app/(marketing)/page.tsx`.
*   Build Hero, Story, Featured categories, Featured products placeholders, Trust signals, and Newsletter signup panels.
*   Apply scroll-triggered animation variants from the motion system.
*   Implement Open Graph and Twitter Card metadata.
*   Verify performance score (Lighthouse Performance >= 90, SEO = 100).

### What Does NOT Belong in Phase 3
*   Real product data queries.
*   Active newsletter API integration.
*   Working checkout/cart operations.

### Quality Gate Phase 3
- [ ] Perform Lighthouse audit (confirm Performance >= 90, Accessibility >= 90, SEO = 100).
- [ ] Run `npm run lint` -> exit code 0.
- [ ] Run build compile -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 3 Complete"`.

---

## Phase 4 — Shop (Product Listing)

**Goal:** Build the product listing experience — the shop index, category pages, filtering, and sorting — with static data.

### What Belongs in Phase 4
*   Build `app/(shop)/shop/page.tsx` and `app/(shop)/shop/[category]/page.tsx`.
*   Build `features/shop/components/ProductCard/` and `ProductGrid/`.
*   Build FilterPanel and SortDropdown.
*   Build `features/shop/hooks/useProductFilters.ts` for URL-synchronized filter states.
*   Populate with realistic static product details.
*   Implement skeleton loading states.

### What Does NOT Belong in Phase 4
*   Active database configurations.
*   Add-to-cart operations.

### Quality Gate Phase 4
- [ ] Verify filters update browser query params and filter static grid.
- [ ] Run `npm run lint` and typescript checks -> exit code 0.
- [ ] Run build compiler check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 4 Complete"`.

---

## Phase 5 — Product Detail

**Goal:** Build the product detail page — the full product view with image gallery, variant selection, description, and size guide.

### What Belongs in Phase 5
*   Build `app/(shop)/product/[slug]/page.tsx`.
*   Build image gallery zoom features, info panel, and variant selectors.
*   Build SizeGuide interactive modal.
*   Implement structured product metadata (JSON-LD) for search crawlers.

### What Does NOT Belong in Phase 5
*   Live database access or database collections.
*   Active basket actions.

### Quality Gate Phase 5
- [ ] Run built page through rich snippet testing tool or schema validators.
- [ ] Run `npm run lint` and typescript checks -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 5 Complete"`.

---

## Phase 6 — Cart

**Goal:** Build the full shopping cart experience — client-side cart state, cart drawer, cart page, and item management.

### What Belongs in Phase 6
*   Build `features/cart/store.ts` (client-state client-side store with local storage sync).
*   Build CartDrawer, CartItem line, CartSummary totals.
*   Build `app/(shop)/cart/page.tsx`.
*   Add active cart count badge to the desktop/mobile Header.
*   Implement optimistic UI updates for quantity operations.

### What Does NOT Belong in Phase 6
*   Stripe Checkout sessions or active payment processing.
*   Server-side persistent database cart syncs.

### Quality Gate Phase 6
- [ ] Verify adding item to basket increments Header count, opens Drawer, and updates localStorage.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 6 Complete"`.

---

## Phase 7 — Authentication

**Goal:** Implement secure user authentication — registration, login, logout, and session management — using abstract auth helper patterns.

### What Belongs in Phase 7
*   Configure auth framework routes (`app/api/auth/[...nextauth]/route.ts` or equivalent).
*   Configure credential-based and OAuth provider credentials stubs.
*   Build LoginForm, RegisterForm, and AuthModal UI utilities.
*   Build `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx`.
*   Implement auth protection middleware for dashboard paths.
*   Create user collection database models.

### What Does NOT Belong in Phase 7
*   Products, categories, or order database schema models (Phase 9).
*   User email dispatch systems.

### Quality Gate Phase 7
- [ ] Test registration, login redirect, protected page blocks, and logout operations.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 7 Complete"`.

---

## Phase 8 — User Dashboard

**Goal:** Build the authenticated user dashboard — account overview, profile management, and order history shell.

### What Belongs in Phase 8
*   Build dashboard views (overview page, profile management edit forms, order list shell).
*   Build AccountNav sidebar navigation components.
*   Verify middleware protections block access to unauthenticated sessions.

### What Does NOT Belong in Phase 8
*   Live order history database lookups.
*   Active invoice generators.

### Quality Gate Phase 8
- [ ] Verify profile form renders and blocks access to logged-out sessions.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build compiler check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 8 Complete"`.

---

## Phase 9 — Database Integration

**Goal:** Replace all static data with live relational data via database ORM layers. Define schemas and implement queries.

### What Belongs in Phase 9
*   Define `schema.prisma` (or database schema equivalents): User, Product, Category, Order, OrderItem.
*   Execute structural migration operations.
*   Write seed scripts to populate database records.
*   Implement `services/db/` product and user query stubs.
*   Replace static arrays inside shop views, category pages, and dashboard summaries.

### What Does NOT Belong in Phase 9
*   Active transactional payment checkouts.
*   Media service cloud asset uploads.

### Quality Gate Phase 9
- [ ] Run database seeding script, verify records exist in database engine.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build compile -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 9 Complete"`.

---

## Phase 10 — Backend API

**Goal:** Build the complete REST API layer — Route Handlers for all resources — and connect all frontend features to the API.

### What Belongs in Phase 10
*   Build Route Handlers for products, orders, and users.
*   Implement schemas to validate body variables.
*   Implement standard response envelopes.
*   Configure transactional mail dispatching wrappers.
*   Send order creation updates and registration greetings.

### What Does NOT Belong in Phase 10
*   Admin dashboard tools.
*   Media cloud upload wrappers.

### Quality Gate Phase 10
- [ ] Query API endpoints via local client; check response shapes match guidelines.
- [ ] Run `npm run lint` and typescript checks -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 10 Complete"`.

---

## Phase 11 — Image Upload

**Goal:** Implement image upload for products using the selected media storage provider. Build the upload API and integrate with the product management flow.

### What Belongs in Phase 11
*   Configure cloud storage SDK wrappers.
*   Build image upload backend endpoints.
*   Build ImageUploader UI components.
*   Implement responsive image optimization transformations.
*   Connect seed image urls to cloud storage endpoints.

### What Does NOT Belong in Phase 11
*   Admin panels.
*   Account profile settings modifications.

### Quality Gate Phase 11
- [ ] Upload an image via component; check file is uploaded to the cloud service and returns a URL.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build compiler check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 11 Complete"`.

---

## Phase 12 — Inventory Management

**Goal:** Build admin-facing inventory management — the ability to create, update, and manage products and categories.

### What Belongs in Phase 12
*   Add role checks to User models.
*   Create administrator layout paths (`app/(admin)/admin/`).
*   Build Product manager grids, details, forms, and categories editor components.
*   Build API endpoints for admin execution tasks.

### What Does NOT Belong in Phase 12
*   Order shipping dispatch controllers.
*   Visitor analytics metrics dashboards.

### Quality Gate Phase 12
- [ ] Verify standard user session is blocked from admin layout paths.
- [ ] Run `npm run lint` and typescript compiler checks -> exit code 0.
- [ ] Run build compiler check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 12 Complete"`.

---

## Phase 13 — Order Management

**Goal:** Implement the full order lifecycle — creation, status tracking, and admin order management.

### What Belongs in Phase 13
*   Define order status enums (PENDING, PROCESSING, SHIPPED, DELIVERED, etc.).
*   Build order summary details page `/dashboard/orders/[id]`.
*   Build administrator view to list, manage, and update order statuses.
*   Trigger transactional email dispatches on status changes.

### What Does NOT Belong in Phase 13
*   Active credit card captures.
*   Courier shipping API integrations.

### Quality Gate Phase 13
- [ ] Change order status via admin panel; confirm client view and email state update.
- [ ] Run `npm run lint` and typescript compiler check -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 13 Complete"`.

---

## Phase 14 — Payments Integration

**Goal:** Implement the complete checkout and payment flow using the chosen payment processor — from cart to paid order.

### What Belongs in Phase 14
*   Configure payment gateway SDK wrappers.
*   Create checkout session endpoint and webhook listener.
*   Build CheckoutForm address panels and PaymentForm card modules.
*   Handle webhook payment success/failure events.
*   Clear client basket and dispatch order confirmation mail on success.

### What Does NOT Belong in Phase 14
*   Subscription billing tools.
*   Multi-currency filters.

### Quality Gate Phase 14
- [ ] Complete a test transaction; verify webhook processes order, creates database record, and clears cart.
- [ ] Run `npm run lint` and typescript check -> exit code 0.
- [ ] Run build check -> exit code 0.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated.
- [ ] Run `git add . && git commit -m "Phase 14 Complete"`.

---

## Phase 15 — Deployment

**Goal:** Deploy XINVORA to production. Configure production environment, monitoring, analytics, and performance validation.

### What Belongs in Phase 15
*   Link code project to hosting platform pipelines.
*   Configure live production variables.
*   Configure domains, live databases, media hosting accounts, payment gateways, and mail routes.
*   Install application error monitoring libraries.
*   Perform production Lighthouse metrics audit (Performance >= 90).

### What Does NOT Belong in Phase 15
*   New feature definitions or component additions.

### Quality Gate Phase 15
- [ ] Verify live domain renders, logs in, processes test charge, and records database updates.
- [ ] Confirm all environment checks verify successfully in host control panel.
- [ ] Confirm `PROJECT_STATUS.md` and `CHANGELOG.md` are updated to state deployment is complete.
- [ ] Run `git add . && git commit -m "Phase 15 Complete"`.

---

## Phase Dependency Matrix

| Phase | Depends On | Blocks |
|---|---|---|
| Phase 1 | Nothing | All phases |
| Phase 2A | Phase 1 | Phase 2B, 2C, 2D |
| Phase 2B | Phase 2A | Phase 2C, 2D, 3, 4, 5, 6 |
| Phase 2C | Phase 2B | Phase 3 |
| Phase 2D | Phase 2B | Phase 3 |
| Phase 3 | Phase 2C, 2D | Phase 4 |
| Phase 4 | Phase 2B, 3 | Phase 5 |
| Phase 5 | Phase 4 | Phase 6 |
| Phase 6 | Phase 5 | Phase 14 |
| Phase 7 | Phase 2A | Phase 8 |
| Phase 8 | Phase 7 | Phase 9 |
| Phase 9 | Phase 8, 4, 5 | Phase 10, 11 |
| Phase 10 | Phase 9 | Phase 11, 12, 13 |
| Phase 11 | Phase 10 | Phase 12 |
| Phase 12 | Phase 11 | Phase 13 |
| Phase 13 | Phase 12 | Phase 14 |
| Phase 14 | Phase 6, 13 | Phase 15 |
| Phase 15 | Phase 14 | Nothing (launch) |

---

*XINVORA DEVELOPMENT_WORKFLOW.md — v1.1.0*
*Established: 2026*
