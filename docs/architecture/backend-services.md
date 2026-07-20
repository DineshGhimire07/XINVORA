# Backend Services & Data Access Boundaries

## Data Access Layer Design
All data interactions flow through dedicated service and repository layers:

```text
Server Action ➔ Service Layer ➔ Repository Layer ➔ Drizzle ORM ➔ PostgreSQL
```

---

## Core Services & Repositories

### 1. Privacy Domain (`src/services/cookie-consent.service.ts` & `src/repositories/cookie-consent.repository.ts`)
- `saveConsent()`: Inserts active consent record & writes audit log.
- `withdrawConsent()`: Non-destructive withdrawal (`isActive: false`, `withdrawnAt: new Date()`).
- `syncGuestConsentToUser()`: Merges guest cookie choices upon login.
- `publishPolicyVersion()`: Stores immutable policy snapshot in `cookiePolicyVersions`.

### 2. Analytics Domain (`src/services/analytics.service.ts` & `src/repositories/analytics.repository.ts`)
- `recordEventsBatch()`: Inserts queued user events into `userEvents`.
- `recordSearch()`: Logs search term, results count, and conversion state in `searchQueries`.
- `getExecutiveDashboardMetrics()`: Computes gross/net revenue, AOV, funnel conversions, and opt-in rates.

### 3. Cart & Commerce Domain (`src/services/cart.service.ts`)
- `getCart()`: Fetches live cart items and price book entries.
- `mergeGuestCart()`: Transfers guest cart items into authenticated user cart upon login.

---

**Last Updated**: July 20, 2026
