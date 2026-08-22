# XINVORA — Duplicate Index Audit

**Date:** 2026-08-22  
**Branch:** fix/prod-stability-audit-2026-08-22

## Background

Supabase identified duplicate unique indexes. This document traces the origin of each duplicate,
determines which is constraint-backed vs manually created, and recommends safe removal.

## Confirmed Duplicates

### 1. orders.internal_id

**Index A:** `orders_internal_id_key` (auto-created by Postgres for UNIQUE constraint)
**Index B:** `orders_internal_id_unique` (created by Drizzle migration 0004_low_pride.sql line 261)

Source:
- Schema: `internalId: integer("internal_id").generatedAlwaysAsIdentity().unique()`
- The `.unique()` call causes Drizzle to emit BOTH a unique constraint AND a constraint name `_unique`
- The column is also `GENERATED ALWAYS AS IDENTITY` which Postgres backs with a sequence, not an index
- But the UNIQUE constraint itself creates `orders_internal_id_key` (Postgres default naming)
- And the Drizzle migration explicitly adds: `ALTER TABLE "orders" ADD CONSTRAINT "orders_internal_id_unique" UNIQUE("internal_id")`
- This creates TWO unique constraints on the same column = TWO indexes

**Recommendation:** Drop `orders_internal_id_unique` (the Drizzle-named one).
Keep `orders_internal_id_key` (the Postgres system-named one tied to the column constraint).

**Safe to drop?** YES — dropping one of two duplicate unique constraints on the same column
is safe. The remaining constraint still enforces uniqueness. No FK references this constraint.

```sql
-- Safe to run:
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_internal_id_unique";
```

---

### 2. orders.invoice_number

**Index A:** `orders_invoice_number_key` (auto-created by Postgres for UNIQUE constraint from initial schema)
**Index B:** `orders_invoice_number_unique` (created by Drizzle migration)

Source:
- Schema: `invoiceNumber: varchar("invoice_number", { length: 50 }).unique()`
- Migration 0004_low_pride.sql adds the column: `ADD COLUMN "invoice_number" varchar(50)`
- But initial 0000 migration may also have the column — this needs DB-level verification
- The `.unique()` in Drizzle schema causes Drizzle kit to generate BOTH constraint styles

**Recommendation:** Drop `orders_invoice_number_unique`.
Keep `orders_invoice_number_key`.

**Safe to drop?** YES — same reasoning as above. No FK references invoice_number.

```sql
-- Safe to run:
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_invoice_number_unique";
```

---

### 3. user_sessions.session_key

**Index A:** `user_sessions_session_key_unique` (from `.unique()` in schema definition)
**Index B:** `user_sessions_session_key_uidx` (from `uniqueIndex("session_key_uidx").on(table.sessionKey)`)

Source (`user-sessions.ts`):
```ts
sessionKey: varchar("session_key", { length: 255 }).notNull().unique(),
// ...
uniqueIndex("session_key_uidx").on(table.sessionKey)
```

Both are defined in the SAME Drizzle schema file. This is a clear authoring bug —
the column has `.unique()` AND an explicit `uniqueIndex()`.

**Recommendation:** Remove `uniqueIndex("session_key_uidx")` from the schema since `.unique()` on
the column already creates the constraint. The named index is redundant.

**Safe to drop?** YES — the `.unique()` constraint enforces the same guarantee.
The explicit `uniqueIndex` was likely added by mistake. No FK references session_key.

**Action required:**
1. Remove `uniqueIndex("session_key_uidx")` from `user-sessions.ts` schema
2. Drop the redundant index in production:
```sql
DROP INDEX IF EXISTS "user_sessions_session_key_uidx";
```

> [!NOTE]
> The Drizzle schema must be updated so the next `drizzle-kit generate` does not
> try to re-create this index. This is a schema fix, not just a DB fix.

---

## Schema Fix Required

**File:** `src/db/schema/user-sessions.ts`

Remove the `uniqueIndex("session_key_uidx")` line since `sessionKey` already has `.unique()`.

The `orders` duplicates are migration artifacts (not in the current schema definition) and
require only DB-level cleanup — the schema itself is correct.

## Summary

| DUPLICATE | SAFE TO DROP | DROP COMMAND | SCHEMA CHANGE NEEDED? |
|-----------|-------------|--------------|----------------------|
| `orders_internal_id_unique` | YES | `ALTER TABLE "orders" DROP CONSTRAINT "orders_internal_id_unique"` | No |
| `orders_invoice_number_unique` | YES | `ALTER TABLE "orders" DROP CONSTRAINT "orders_invoice_number_unique"` | No |
| `user_sessions_session_key_uidx` | YES | `DROP INDEX "user_sessions_session_key_uidx"` | YES — remove uniqueIndex() from schema |

## Manual Production Steps Required

These SQL commands must be run manually against production Supabase:

```sql
-- Remove duplicate constraint indexes on orders table
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_internal_id_unique";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_invoice_number_unique";

-- Remove redundant manual unique index on user_sessions
DROP INDEX IF EXISTS "user_sessions_session_key_uidx";
```

**Do NOT run these without first verifying:**
1. The constraint being kept (`_key` versions) still exists
2. No application code references the constraint by name
3. A backup exists
