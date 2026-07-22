---
name: xinvora-dev-standards
description: Standardized development conventions and domain-driven architecture guidelines for XINVORA enterprise e-commerce platform.
---

# XINVORA Engineering Standards & Development Workflows

This skill documents the repository conventions, domain-driven context boundaries, Drizzle ORM database patterns, and SEO Engine architecture for developers working on the XINVORA platform.

## Architecture Blueprint

```text
src/
├── app/                  # Next.js 16 App Router (UI Ownership)
│   ├── (admin)/admin/   # Admin Control Panels & Workspaces
│   └── (shop)/          # Customer-Facing Storefront
├── domains/              # Bounded Domain Contexts (Pure Business Logic)
│   └── seo/
│       ├── adapters/     # Normalizer Adapters (Product, Collection, Journal, CMS)
│       ├── contracts/    # TypeScript Interfaces & Contracts
│       ├── engines/      # Pure Stateless Business Engines (Score, Schema, Sitemap, etc.)
│       ├── repositories/ # CQRS Layer (SEOReadRepository & SEOWriteRepository)
│       └── services/     # Orchestrating Domain Services (SEOService)
├── db/                   # Database Schemas & Drizzle ORM Client
│   ├── client.ts         # PostgreSQL Connection Pool
│   └── schema/           # Normalized Table Declarations
├── actions/              # Next.js Server Actions (Session-Guarded Mutators)
└── lib/                  # Utilities & Spoof-Proof Helpers
```

## Key Development Rules

1. **Keep UI Thin, Move Logic to Domain Engines**:
   - Next.js App Router components (`src/app/`) own rendering and user interaction only.
   - All scoring algorithms, schema generators, and rules MUST reside in pure stateless domain engines (`src/domains/seo/engines/`).

2. **Drizzle ORM Query Efficiency**:
   - Always export new schemas in `src/db/schema/index.ts`.
   - Prefer prefetched batch entity queries over N+1 loops.
   - Wrap mutators inside `db.transaction()` for multi-table atomicity.

3. **Server Action Protection**:
   - Guard all administrative Server Actions using `SessionService.requireAdmin()`.
   - Use `revalidatePath()` after write operations to update server component caches instantly.

4. **SEO Metadata Clamping**:
   - Enforce Title lengths between 50–60 characters.
   - Enforce Meta Description lengths between 140–160 characters.
   - Always include `OfferShippingDetails` and `MerchantReturnPolicy` in Product JSON-LD for Google Merchant Center badges.
