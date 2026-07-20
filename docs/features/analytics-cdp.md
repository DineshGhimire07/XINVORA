# Feature Documentation — Customer Data & Analytics Engine (CDP)

## Purpose
Collects consent-gated customer events, session behavior, and search queries to generate real-time executive business intelligence.

---

## Architecture

```text
Client Event ➔ tracker.ts ➔ analyticsQueue ➔ POST /api/analytics/track ➔ AnalyticsService ➔ AnalyticsRepository ➔ PostgreSQL
```

---

## Core Features
1. **Anonymous ID Tracking**: `getOrCreateAnonymousId()` manages persistent `xinvora_anon_id` cookies.
2. **Non-Blocking Queue**: `analyticsQueue` batches events in memory and flushes asynchronously.
3. **Executive BI Dashboard (`/admin/cdp`)**:
   - Gross & Net Revenue Line Charts.
   - Conversion Funnel (Homepage ➔ Product ➔ Cart ➔ Checkout ➔ Order).
   - Top Viewed & Purchased Products.
   - Search Query Conversion Intelligence.

---

**Last Updated**: July 20, 2026
