import { pgTable, uuid, varchar, boolean, timestamp, integer, numeric, text, jsonb, date, index } from "drizzle-orm/pg-core"
import { users } from "./users"
import { products } from "./products"

/**
 * analyticsSessions — Session aggregates
 */
export const analyticsSessions = pgTable(
  "analytics_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    anonymousId: varchar("anonymous_id", { length: 64 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    device: varchar("device", { length: 30 }),
    browser: varchar("browser", { length: 50 }),
    country: varchar("country", { length: 10 }),
    landingPage: varchar("landing_page", { length: 255 }),
    exitPage: varchar("exit_page", { length: 255 }),
    pageCount: integer("page_count").notNull().default(1),
    eventCount: integer("event_count").notNull().default(1),
    duration: integer("duration").default(0), // in seconds
    bounce: boolean("bounce").notNull().default(true),
  },
  (table) => [
    index("analytics_sessions_anonymous_id_idx").on(table.anonymousId),
    index("analytics_sessions_user_id_idx").on(table.userId),
    index("analytics_sessions_started_at_idx").on(table.startedAt),
  ]
)

/**
 * searchQueries — Search intelligence
 */
export const searchQueries = pgTable(
  "search_queries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    anonymousId: varchar("anonymous_id", { length: 64 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    query: varchar("query", { length: 255 }).notNull(),
    resultsCount: integer("results_count").notNull().default(0),
    clickedProductId: uuid("clicked_product_id").references(() => products.id, { onDelete: "set null" }),
    converted: boolean("converted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("search_queries_query_idx").on(table.query),
    index("search_queries_created_at_idx").on(table.createdAt),
  ]
)

/**
 * dailyMetrics — Pre-aggregated daily KPIs
 */
export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull().unique(),
    totalVisitors: integer("total_visitors").notNull().default(0),
    totalSessions: integer("total_sessions").notNull().default(0),
    totalOrders: integer("total_orders").notNull().default(0),
    grossRevenue: integer("gross_revenue").notNull().default(0), // in cents
    netRevenue: integer("net_revenue").notNull().default(0), // in cents
    aov: integer("aov").notNull().default(0), // in cents
    conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
    bounceRate: numeric("bounce_rate", { precision: 5, scale: 2 }).default("0.00"),
    optInRate: numeric("opt_in_rate", { precision: 5, scale: 2 }).default("0.00"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("daily_metrics_date_idx").on(table.date),
  ]
)

/**
 * productMetrics — Materialized product engagement & conversion stats
 */
export const productMetrics = pgTable(
  "product_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull().unique(),
    views: integer("views").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    wishlists: integer("wishlists").notNull().default(0),
    addToCart: integer("add_to_cart").notNull().default(0),
    orders: integer("orders").notNull().default(0),
    conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_metrics_product_id_idx").on(table.productId),
  ]
)

/**
 * customerProfiles — Aggregated customer journey profiles
 */
export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    anonymousId: varchar("anonymous_id", { length: 64 }).notNull().unique(),
    firstVisit: timestamp("first_visit").defaultNow().notNull(),
    lastVisit: timestamp("last_visit").defaultNow().notNull(),
    sessionCount: integer("session_count").notNull().default(1),
    orderCount: integer("order_count").notNull().default(0),
    lifetimeValue: integer("lifetime_value").notNull().default(0), // in cents
    favoriteCategory: varchar("favorite_category", { length: 100 }),
    favoriteColor: varchar("favorite_color", { length: 50 }),
    favoriteSize: varchar("favorite_size", { length: 50 }),
    preferredDevice: varchar("preferred_device", { length: 30 }),
    averageOrderValue: integer("average_order_value").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("customer_profiles_user_id_idx").on(table.userId),
    index("customer_profiles_anonymous_id_idx").on(table.anonymousId),
  ]
)
