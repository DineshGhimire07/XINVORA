import { pgTable, uuid, varchar, integer, numeric, timestamp, boolean, jsonb, index, text } from "drizzle-orm/pg-core"

export const gscProperties = pgTable("gsc_properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyUrl: varchar("property_url", { length: 500 }).notNull().unique(),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  accessToken: text("access_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isConnected: boolean("is_connected").default(true).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const gscDailyMetrics = pgTable("gsc_daily_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => gscProperties.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  clicks: integer("clicks").default(0).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0").notNull(),
  position: numeric("position", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gsc_daily_metrics_property_date_idx").on(table.propertyId, table.date),
])

export const gscQueryMetrics = pgTable("gsc_query_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => gscProperties.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  query: varchar("query", { length: 500 }).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0").notNull(),
  position: numeric("position", { precision: 5, scale: 2 }).default("0").notNull(),
  intentType: varchar("intent_type", { length: 50 }).default("COMMERCIAL"), // COMMERCIAL | INFORMATIONAL | NAVIGATIONAL
  clusterId: varchar("cluster_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gsc_query_metrics_query_idx").on(table.query),
  index("gsc_query_metrics_property_date_idx").on(table.propertyId, table.date),
])

export const gscPageMetrics = pgTable("gsc_page_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => gscProperties.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  pageUrl: varchar("page_url", { length: 1024 }).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0").notNull(),
  position: numeric("position", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gsc_page_metrics_page_url_idx").on(table.pageUrl),
])

export const gscSyncLogs = pgTable("gsc_sync_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => gscProperties.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(), // SUCCESS | FAILED | RUNNING
  recordsSynced: integer("records_synced").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const gscAlerts = pgTable("gsc_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => gscProperties.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 100 }).notNull(), // TRAFFIC_DROP | RANKING_DROP | CTR_DROP
  severity: varchar("severity", { length: 20 }).default("MEDIUM").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  details: jsonb("details"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
