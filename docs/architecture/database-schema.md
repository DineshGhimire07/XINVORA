# Database Schema & Data Models

## Overview
XINVORA uses Drizzle ORM configured with PostgreSQL (Supabase). Schema definitions are located in `src/db/schema/`.

---

## Core Table Schemas

### 1. Privacy & CMP (`src/db/schema/cookie-consent.ts`)
- `cookieConsents`: Legal record of user choices (`userId`, `necessary`, `analytics`, `marketing`, `personalization`, `ipHash`, `consentGivenAt`, `isActive`, `withdrawnAt`).
- `cookieConsentAuditLogs`: Audit log (`consentId`, `userId`, `oldValues`, `newValues`, `action`, `ipHash`, `createdAt`).
- `cookiePolicyVersions`: Policy versioning table (`version`, `description`, `policySnapshot`, `requiresReconsent`).

### 2. Analytics & CDP (`src/db/schema/analytics.ts` & `src/db/schema/user-events.ts`)
- `userEvents`: Low-level event log (`eventId`, `sessionId`, `eventType`, `page`, `productId`, `device`, `country`, `payload`).
- `analyticsSessions`: Session aggregates (`anonymousId`, `startedAt`, `endedAt`, `pageCount`, `duration`, `bounce`).
- `searchQueries`: Search tracking (`query`, `resultsCount`, `clickedProductId`, `converted`).
- `dailyMetrics`: Pre-aggregated daily KPIs (`totalVisitors`, `grossRevenue`, `netRevenue`, `aov`, `conversionRate`).
- `productMetrics`: Product-level engagement (`views`, `clicks`, `wishlists`, `addToCart`, `orders`).

### 3. Commerce & Catalog (`src/db/schema/`)
- `products`: Product catalog definitions (`id`, `name`, `slug`, `categoryId`, `brandId`, `isActive`).
- `variants`: Size and color variants (`productId`, `sku`, `colorId`, `sizeId`, `isActive`).
- `inventory`: Variant stock levels (`variantId`, `quantity`).
- `priceBookEntries`: Price book entries (`variantId`, `price`, `compareAtPrice`).
- `orders`: Customer orders (`userId`, `orderNumber`, `status`, `total`, `taxAmount`, `shippingAmount`).

---

**Last Updated**: July 20, 2026
