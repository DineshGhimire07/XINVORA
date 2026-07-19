import { pgTable, uuid, integer, primaryKey, index } from "drizzle-orm/pg-core"
import { products } from "./products"

export const productPairings = pgTable("product_pairings", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  pairedProductId: uuid("paired_product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.productId, t.pairedProductId] }),
  index("product_pairings_product_id_idx").on(t.productId),
])
