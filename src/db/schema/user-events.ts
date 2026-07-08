import { pgTable, uuid, varchar, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core"
import { users } from "./users"
import { userSessions } from "./user-sessions"
import { deviceTypeEnum } from "./enums"

export const userEvents = pgTable("user_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().unique(),
  sessionId: uuid("session_id").references(() => userSessions.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // Strict type from registry
  
  // First-Class Dimensions
  productId: uuid("product_id"),
  categoryId: uuid("category_id"),
  orderId: uuid("order_id"),
  page: varchar("page", { length: 2083 }).notNull(),
  referrer: varchar("referrer", { length: 2083 }),
  device: deviceTypeEnum("device").notNull(),
  country: varchar("country", { length: 2 }),
  
  // Debug & Queue Metrics
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  processingDuration: integer("processing_duration_ms").default(0).notNull(),
  source: varchar("source", { length: 30 }).default("WEB").notNull(), // WEB, APP, CRON
  
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("event_session_idx").on(table.sessionId),
  index("event_user_type_created_idx").on(table.userId, table.eventType, table.createdAt),
  index("event_product_idx").on(table.productId),
  index("event_order_idx").on(table.orderId),
  index("event_created_idx").on(table.createdAt),
])
