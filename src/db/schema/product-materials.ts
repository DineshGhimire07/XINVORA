import { pgTable, uuid, primaryKey, index } from "drizzle-orm/pg-core"
import { products } from "./products"
import { materials } from "./materials"

export const productMaterials = pgTable("product_materials", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id, { onDelete: "restrict" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.productId, t.materialId] }),
  index("product_materials_product_id_idx").on(t.productId),
])
