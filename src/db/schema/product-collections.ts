import { pgTable, uuid, primaryKey, index } from "drizzle-orm/pg-core"
import { products } from "./products"
import { collections } from "./collections"

export const productCollections = pgTable("product_collections", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.productId, t.collectionId] }),
  index("product_collections_product_id_idx").on(t.productId),
  index("product_collections_collection_id_idx").on(t.collectionId),
])
