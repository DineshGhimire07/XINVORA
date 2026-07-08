import { pgTable, uuid, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { carts } from "./carts"
import { variants } from "./variants"

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").references(() => carts.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "restrict" }).notNull(),
  quantity: integer("quantity").notNull(),
  priceSnapshot: integer("price_snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cart_variant_idx").on(table.cartId, table.variantId),
])
