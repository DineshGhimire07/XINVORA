import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"
import { deviceTypeEnum } from "./enums"

/**
 * user_sessions — one row per browser session.
 *
 * IDENTITY MODEL:
 *   anonymous_id  — persistent browser identity (from xinvora_anon_id cookie).
 *                   ONE anonymous visitor → MANY sessions.
 *                   Nullable: NULL for sessions created before this column was added.
 *   session_key   — localStorage UUID identifying this specific session.
 *   user_id       — nullable; populated when a visitor logs in (isUserMerge).
 *
 * ACCOUNT-SWITCH SAFETY:
 *   When Person B logs in after Person A on the same browser, the tracking
 *   provider rotates session_key, so Person B gets a fresh row here and
 *   Person A's events remain attributed to Person A.
 */
export const userSessions = pgTable("user_sessions", {
  id:         uuid("id").defaultRandom().primaryKey(),
  userId:     uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Nullable for guests
  sessionKey: varchar("session_key", { length: 255 }).notNull().unique(),

  // ── Anonymous Identity ─────────────────────────────────────────────────────
  // Persistent browser-level identity key (from xinvora_anon_id cookie).
  // Enables COUNT(DISTINCT anonymous_id) queries for unique visitor metrics
  // and connecting behavior across multiple sessions from the same browser.
  // NULL for sessions created before migration 0014.
  anonymousId: varchar("anonymous_id", { length: 64 }),

  startedAt:      timestamp("started_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  endedAt:        timestamp("ended_at"),

  // ── Device & Client Information ────────────────────────────────────────────
  deviceType:      deviceTypeEnum("device_type").notNull(), // DESKTOP, MOBILE, TABLET
  browser:         varchar("browser", { length: 50 }).notNull(),
  operatingSystem: varchar("operating_system", { length: 50 }).notNull(),
  ipAddress:       varchar("ip_address", { length: 45 }).notNull(),

  // ── GeoIP Attributes ──────────────────────────────────────────────────────
  countryCode: varchar("country_code", { length: 2 }), // ISO 3166-1 alpha-2
  region:      varchar("region", { length: 100 }),
  city:        varchar("city", { length: 100 }),
  timezone:    varchar("timezone", { length: 50 }),

  // ── Acquisition UTM Parameters ────────────────────────────────────────────
  utmSource:   varchar("utm_source", { length: 50 }),
  utmMedium:   varchar("utm_medium", { length: 50 }),
  utmCampaign: varchar("utm_campaign", { length: 50 }),
}, (table) => [
  index("session_user_idx").on(table.userId),
  index("session_started_idx").on(table.startedAt),

  // ── Anonymous identity + date composite ───────────────────────────────────
  // Justification: COUNT(DISTINCT anonymous_id) WHERE started_at BETWEEN :s AND :e
  // and single-visitor session lookups (WHERE anonymous_id = :id).
  // Added in migration 0014_analytics_identity_schema.sql
  index("session_anon_started_idx").on(table.anonymousId, table.startedAt),

  // ── UTM attribution + date composite ─────────────────────────────────────
  // Justification: Traffic tab GROUP BY utm_source WHERE started_at BETWEEN
  // Added in migration 0014_analytics_identity_schema.sql
  index("session_utm_source_started_idx").on(table.utmSource, table.startedAt),

  // ── Geo analytics + date composite ───────────────────────────────────────
  // Justification: Geo breakdown GROUP BY country_code WHERE started_at BETWEEN
  // Added in migration 0014_analytics_identity_schema.sql
  index("session_country_started_idx").on(table.countryCode, table.startedAt),

  // NOTE: sessionKey uniqueness is enforced by the .unique() column constraint above.
  // A separate uniqueIndex("session_key_uidx") was previously defined here and created
  // a duplicate index in the database. Removed in fix/prod-stability-audit-2026-08-22.
])
