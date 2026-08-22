# XINVORA — RLS Security Audit

**Date:** 2026-08-22  
**Branch:** fix/prod-stability-audit-2026-08-22  
**Base commit:** dc6e0a6

## Key Finding

No direct Supabase/PostgREST client usage exists anywhere in the application.
All database access is exclusively through server-side Drizzle ORM via DATABASE_URL.
Because DATABASE_URL connects as the Postgres service role, RLS policies created with
auth.uid() have no enforcement effect for application queries — the service role bypasses RLS.

The real authorization layer is: SessionService.requireAuth() / SessionService.requireAdmin()

## RLS Status after migrate-rls.ts

migrate-rls.ts was already run. It enabled RLS on all 47 listed tables and created:
- Public read policies on catalog tables (products, variants, categories, etc.)
- User-scoped policies using auth.uid() on users, profiles, wishlists, carts, addresses, orders, notifications

## Table-by-Table Findings

| TABLE | RLS ENABLED | POLICIES | ACCESS PATH | REQUIRED | RISK | SAFE TO CHANGE? |
|-------|------------|----------|-------------|----------|------|-----------------|
| products | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| variants | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| product_images | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| variant_images | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| categories | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| collections | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| brands | Yes | Public read | Server Drizzle | Public SELECT | Low | No change needed |
| inventory | Yes | Public read | Server Drizzle | Stock level OK public | Low | No change needed |
| app_settings | Yes | Public read | Server Drizzle | Server-only | HIGH | REVIEW NEEDED — contains payment QR configs |
| price_books | Yes | Public read | Server Drizzle | Server-only | Medium | Consider restricting |
| price_book_entries | Yes | Public read | Server Drizzle | Server-only | Medium | Consider restricting |
| users | Yes | view/update own | Server Drizzle | Server-only | Low | auth.uid() no-op; harmless |
| profiles | Yes | view/update own | Server Drizzle | Server-only | Low | Same |
| wishlists | Yes | manage own | Server Drizzle | Server-only | Low | Same |
| carts | Yes | manage own | Server Drizzle | Server-only | Low | Same |
| addresses | Yes | manage own | Server Drizzle | Server-only | Low | Same |
| orders | Yes | view/create own | Server Drizzle | Server-only | Low | Same |
| order_items | Yes | none | Server Drizzle | Server-only | Low | No change needed |
| payments | Yes | none | Server Drizzle | Server-only | Low | No change needed |
| user_sessions | Yes | none | IngestionService | Server-only | Low | No change needed |
| user_events | Yes | none | IngestionService | Server-only | Low | No change needed |
| customer_metrics | Yes | none | IngestionService | Server-only | Low | No change needed |
| analytics_dlq | Yes | none | IngestionService | Server-only | Low | No change needed |
| admin_audit_logs | Yes | none | Admin actions | Server-only | Low | No change needed |
| media_library | Yes | none | Admin panel | Server-only | Low | No change needed |
| contact_inquiries | Yes | none | Server actions | Server-only | Low | No change needed |
| cookie_consents | UNKNOWN (new) | None | Cookie service | Server-only | Low | Enable RLS, no policies needed |
| cookie_consent_audit_logs | UNKNOWN (new) | None | Cookie service | Server-only | Low | Enable RLS, no policies needed |
| cookie_policy_versions | UNKNOWN (new) | None | Cookie service | Server-only | Low | Enable RLS, no policies needed |
| analytics_sessions | UNKNOWN | None | Admin dashboard | Server-only | Low | Enable RLS safe |
| search_queries | UNKNOWN | None | Analytics | Server-only | Low | Enable RLS safe |
| daily_metrics | UNKNOWN | None | Admin dashboard | Server-only | Low | Enable RLS safe |
| product_metrics | UNKNOWN | None | Admin dashboard | Server-only | Low | Enable RLS safe |
| back_in_stock_requests | UNKNOWN | None | Server actions | Server-only | Low | Enable RLS safe |
| product_off_section | UNKNOWN | None | Server reads | Server-only | Low | Enable RLS safe |

## Action Items

### Requires Manual Review (DO NOT auto-apply):
- app_settings: Has public read RLS policy but contains sensitive admin config
  (payment QR URLs, maintenance mode, feature flags). Should be server-only.
  BEFORE changing: verify checkout page does not rely on PostgREST for this data.
  FINDING: checkout page fetches via Server Action (getPaymentQrsAction) — safe to restrict.

### Safe to Apply (new tables, no RLS yet):
```sql
ALTER TABLE "cookie_consents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cookie_consent_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cookie_policy_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_queries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "back_in_stock_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_off_section" ENABLE ROW LEVEL SECURITY;
```
No policies needed on these — server-only access via privileged connection.

## Why auth.uid() Policies Are Ineffective Here

The application uses DATABASE_URL which is the Postgres service role connection.
In Supabase, service role connections bypass RLS entirely. auth.uid() is only
populated for authenticated Supabase client (anon/user JWT) connections.
The auth.uid() policies provide zero protection against Drizzle queries but are
also harmless since they cannot interfere with server-side access.
