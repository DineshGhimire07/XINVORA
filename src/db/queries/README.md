# XINVORA Repository Layer

This directory contains the database query abstraction layer for the XINVORA storefront. 

According to our architecture principles, **this layer is the single source of truth for all database reads**. Higher layers (such as Server Components, Server Actions, or Services) must never import Drizzle or execute queries directly; they must utilize the repositories exposed here.

## Directory Structure

```
src/db/queries/
├── types.ts          # Shared repository domain types (the contract)
├── products.ts       # Product queries (PDP, PLP, listings, related)
├── categories.ts     # Category taxonomy and navigation tree queries
├── collections.ts    # Editorial and marketing collection queries
├── brands.ts         # Brand metadata queries
├── variants.ts       # Variant SKU lookup queries
└── inventory.ts      # Net available stock queries
```

## Core Principles

1. **Explicit Business Intent**: Repository methods are named after business tasks (e.g. `findProductBySlug()`, `getAvailableStock()`), not generic CRUD names (like `getOne()`, `update()`).
2. **N+1 Prevention**: Every method fetching nested graphs utilizes Drizzle's relational queries (`with` parameters) rather than multiple sequential database calls.
3. **No SQL/Drizzle Leakage**: Repository methods return pure TS objects representing domain entities (types in `types.ts`). Drizzle-specific terminology, raw database exceptions, and SQL queries must remain hidden.
4. **Read-Only Separation**: These repositories handle catalog and stock **reads**. Writes and mutations are handled exclusively through Server Actions (`src/actions/`).

## Usage Example

```typescript
// Inside a React Server Component (e.g., app/products/[slug]/page.tsx)
import { findProductBySlug } from "@/db/queries/products"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await findProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  return (
    <main>
      <h1>{product.name}</h1>
      {/* ... */}
    </main>
  )
}
```
