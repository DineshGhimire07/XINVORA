import { pgTable, uuid, varchar, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core"
import { orders } from "./orders"
import { variants } from "./variants"
import { currencyEnum } from "./enums"

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  // Soft reference: variant may be deleted but the historical order item must remain.
  // SET NULL so deletion of a variant doesn't break order history.
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "set null" }),

  // Immutable snapshots at time of purchase
  productName: varchar("product_name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 255 }).notNull(),
  variantOptions: jsonb("variant_options"), // snapshot of color/size info

  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  currency: currencyEnum("currency").notNull(),
  discountApplied: integer("discount_applied").default(0).notNull(),
  taxApplied: integer("tax_applied").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
])
