import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core"
import { variants } from "./variants"
import { inventoryStatusEnum } from "./enums"

export const inventory = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }).notNull().unique(),
  quantity: integer("quantity").default(0).notNull(),
  reserved: integer("reserved").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  status: inventoryStatusEnum("status").default("OUT_OF_STOCK").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
