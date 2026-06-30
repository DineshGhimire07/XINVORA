# XINVORA — API Route Handlers

This directory is reserved for **Next.js Route Handlers** — server-side HTTP endpoints built with the App Router.

## Architecture

All API routes live under `app/api/` and are organized by domain:

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts   # Auth.js session handler
│   └── profile/route.ts         # User profile CRUD
├── products/
│   ├── route.ts                 # List / search products
│   └── [slug]/route.ts          # Single product by slug
├── orders/
│   ├── route.ts                 # Create order
│   └── [id]/route.ts            # Order detail / status
├── payments/
│   └── route.ts                 # Payment intent creation
├── inventory/
│   └── route.ts                 # Stock level checks
├── upload/
│   └── route.ts                 # File / image upload endpoint
└── webhooks/
    ├── stripe/route.ts          # Stripe payment webhooks
    └── cms/route.ts             # CMS content change webhooks
```

## Rules

- Route Handlers are **Server Components** — never import client-only code.
- Validate all inputs with Zod schemas from `@/lib/validations`.
- Use `@/db` for database access.
- Return consistent `ApiResponse<T>` shapes from `@/types/common`.
- Never expose sensitive data — filter response objects explicitly.

## When to use Route Handlers vs Server Actions

| Use Case | Prefer |
|---|---|
| Form submissions from Client Components | Server Actions (`@/actions/`) |
| REST API for external consumers | Route Handlers |
| Webhook endpoints | Route Handlers |
| Data mutations from Server Components | Server Actions |
| File uploads | Route Handlers |
