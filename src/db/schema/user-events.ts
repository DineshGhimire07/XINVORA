import { pgTable, uuid, varchar, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core"
import { users } from "./users"
import { userSessions } from "./user-sessions"
import { deviceTypeEnum } from "./enums"

/**
 * user_events — one row per analytics event.
 *
 * DIMENSION COLUMNS:
 *   productId    — existing: product analytics, recommendation signals
 *   categoryId   — existing: category-level analytics
 *   orderId      — existing: order attribution
 *   collectionId — NEW (migration 0014): collection analytics.
 *                  GROUP BY collectionId for views, CTR, funnel per collection.
 *                  No FK: collections can be deleted without losing event history.
 *   variantId    — NEW (migration 0014): variant-level behavioral analytics.
 *                  Cart abandonment by variant, size/color demand signals.
 *                  No FK: variants are soft-deleted (deletedAt), not hard-deleted.
 *
 * NOT stored as columns (kept in JSONB payload):
 *   anonymousId  — tracked at session level via user_sessions.anonymous_id
 *   priceAtTime  — financial truth is orders/order_items, not analytics events
 *   cartValue    — context metadata
 *   searchQuery  — stored in payload.query; also written to search_queries table
 */
export const userEvents = pgTable("user_events", {
  id:      uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().unique(),
  sessionId: uuid("session_id")
    .references(() => userSessions.id, { onDelete: "cascade" })
    .notNull(),
  userId:    uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),

  // ── First-Class Dimension Columns ──────────────────────────────────────────
  productId:    uuid("product_id"),
  categoryId:   uuid("category_id"),
  orderId:      uuid("order_id"),
  collectionId: uuid("collection_id"), // NEW — migration 0014
  variantId:    uuid("variant_id"),    // NEW — migration 0014

  page:     varchar("page", { length: 2083 }).notNull(),
  referrer: varchar("referrer", { length: 2083 }),
  device:   deviceTypeEnum("device").notNull(),
  country:  varchar("country", { length: 2 }),

  // ── Debug & Queue Metrics ─────────────────────────────────────────────────
  receivedAt:         timestamp("received_at").defaultNow().notNull(),
  processedAt:        timestamp("processed_at").defaultNow().notNull(),
  processingDuration: integer("processing_duration_ms").default(0).notNull(),
  source:             varchar("source", { length: 30 }).default("WEB").notNull(),

  payload:   jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("event_session_idx").on(table.sessionId),
  index("event_user_type_created_idx").on(table.userId, table.eventType, table.createdAt),
  index("event_product_idx").on(table.productId),
  index("event_order_idx").on(table.orderId),
  index("event_created_idx").on(table.createdAt),

  // ── New indexes for Phase 2 analytics queries (migration 0014) ────────────

  // event_type + created_at composite:
  // Justification: Funnel queries filter on event_type first, then date.
  // Without this, type-filtered aggregations scan event_created_idx + filter type.
  index("event_type_created_idx").on(table.eventType, table.createdAt),

  // collection_id:
  // Justification: GROUP BY collection_id for collection views, CTR, revenue.
  index("event_collection_idx").on(table.collectionId),

  // variant_id:
  // Justification: Variant-level behavioral analytics (cart abandonment by variant).
  index("event_variant_idx").on(table.variantId),
])
