import { pgTable, uuid, varchar, timestamp, integer, bigint } from "drizzle-orm/pg-core"
import { users } from "./users"
import { sql } from "drizzle-orm"

export const customerMetrics = pgTable("customer_metrics", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  
  // Currency in minor units (BIGINT) and currency code
  lifetimeSpend: bigint("lifetime_spend", { mode: "bigint" }).default(sql`0`).notNull(),
  currency: varchar("currency", { length: 3 }).default("NPR").notNull(),
  
  totalOrders: integer("total_orders").default(0).notNull(),
  averageOrderValue: bigint("average_order_value", { mode: "bigint" }).default(sql`0`).notNull(),
  wishlistCount: integer("wishlist_count").default(0).notNull(),
  cartCount: integer("cart_count").default(0).notNull(),
  returnRate: integer("return_rate").default(0).notNull(),
  refundRate: integer("refund_rate").default(0).notNull(),
  sessionCount: integer("session_count").default(0).notNull(),
  averageSessionDuration: integer("average_session_duration").default(0).notNull(),
  
  lastPurchaseAt: timestamp("last_purchase_at"),
  lastVisitAt: timestamp("last_visit_at"),
  favoriteCategory: varchar("favorite_category", { length: 50 }),
  favoriteBrand: varchar("favorite_brand", { length: 50 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
