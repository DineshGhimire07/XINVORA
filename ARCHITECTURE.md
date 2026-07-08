# ARCHITECTURE.md — XINVORA System Architecture

> This document is the definitive reference for how the XINVORA codebase is structured.
> It accurately reflects the real-world application, database, and folder layout.
> 
> **DOCUMENTATION STATE: LIVING REFERENCE**

---

## 1. Tech Stack Overview

XINVORA is built using a modern, server-first React stack:
- **Framework**: Next.js (App Router, React)
- **Database ORM**: Drizzle ORM (with PostgreSQL/Neon Serverless)
- **Authentication**: Auth.js / NextAuth v5 (via `auth.ts` and `auth.config.ts`)
- **Styling**: Tailwind CSS
- **Validation**: Zod & React Hook Form
- **State/UI**: Radix UI primitives, Lucide icons, Framer Motion

## 2. Core Architectural Philosophy

### Server Actions & Data Mutation
We strictly use **Server Actions** for all data mutations (forms, state changes). We do **not** use traditional API routes (`/api/`) for internal app logic. All database writes flow through `src/actions/`, which internally call isolated business logic inside `src/services/`.

### Service-Layer Isolation
React Components (`src/components`, `src/app`) **never** talk to the database directly. They either:
1. Fetch data directly inside Server Components using queries from `src/db/queries/`.
2. Mutate data by calling Server Actions in `src/actions/`, which delegate to `src/services/`.

---

## 3. Folder Structure (`src/`)

```text
src/
├── actions/         # Server Actions (Mutations). The only way the client updates data.
├── animations/      # Framer Motion variants and animation logic.
├── app/             # Next.js App Router (Pages, Layouts, Routing).
├── components/      # Reusable React components (UI primitives & shared blocks).
├── config/          # Centralized application configuration.
├── constants/       # Static system constants.
├── db/              # Database Layer (Drizzle).
│   ├── queries/     # Reusable read-only SQL queries (used by Server Components).
│   ├── schema/      # Drizzle schema definitions (tables, relations).
│   └── client.ts    # Drizzle client instantiation.
├── features/        # Complex, feature-specific modules (e.g. checkout, product filtering).
├── hooks/           # Custom React hooks.
├── lib/             # Shared utility functions (e.g. formatting, helpers).
├── providers/       # Global React context providers (e.g., Theme, Session).
├── services/        # Core business logic. Server Actions call these to do actual work.
├── styles/          # Global stylesheets (globals.css, tailwind base).
├── types/           # TypeScript interfaces and global type definitions.
└── validations/     # Zod schemas used for form validation and API protection.
```

## 4. App Router Structure (`src/app/`)

We heavily use Next.js **Route Groups** to share layouts without affecting the URL path:
- `(shop)/`: The public-facing e-commerce storefront (Home, Categories, Product pages, Cart, Checkout).
- `(admin)/`: The secure admin dashboard (Inventory, CMS, Orders, Settings).
- `(account)/`: The secure customer dashboard (Order history, Profile, Addresses).
- `(auth)/`: Authentication pages (Login, Register).
- `api/`: Only for external integrations (e.g., specific Auth endpoints or custom Nepal logistics APIs). Internal app logic does **not** use these.

## 5. The Checkout Flow

The checkout architecture has been unified into a single, transactional, and resilient pipeline:
1. **Submission**: The `NepalDeliveryForm` submits customer address and choices to `submitCheckoutAction`.
2. **Validation & Idempotency**: The action validates the cart state and verifies an idempotency key to prevent duplicate orders.
3. **Transaction**: Execution passes to `CheckoutService.createOrder`, which opens a Drizzle database transaction.
4. **Operations**: Inside the transaction, stock is verified, prices are finalized, the order is created, and the cart is cleared.
5. **Result**: The user is redirected to the success page. We support COD and eSewa payments natively within this flow.

## 6. How to Add New Features

Follow this strict data flow when adding features:
1. **Database**: Define new tables in `src/db/schema/`.
2. **Business Logic**: Create a new service class in `src/services/` (e.g., `ReviewService`).
3. **Mutations**: Create a Server Action in `src/actions/` that validates input with Zod and calls your Service.
4. **Reads**: Create reusable read functions in `src/db/queries/`.
5. **UI**: Create the page in `src/app/` and consume the read queries. Wire up forms to call your Server Action.
