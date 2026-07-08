import { pgTable, uuid, varchar, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./users"

export const recommendationSignals = pgTable("recommendation_signals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").notNull(),
  brandName: varchar("brand_name", { length: 100 }),
  categorySlug: varchar("category_slug", { length: 100 }),
  
  // Discrete Event Counters
  viewsCount: integer("views_count").default(0).notNull(),
  wishlistAddsCount: integer("wishlist_adds_count").default(0).notNull(),
  cartAddsCount: integer("cart_adds_count").default(0).notNull(),
  purchasesCount: integer("purchases_count").default(0).notNull(),
  returnsCount: integer("returns_count").default(0).notNull(),
  
  lastInteractionAt: timestamp("last_interaction_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_product_signal_uidx").on(table.userId, table.productId),
  index("user_brand_affinity_idx").on(table.userId, table.brandName),
])
