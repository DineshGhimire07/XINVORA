import { pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core"
import { products } from "./products"

export const backInStockRequests = pgTable("back_in_stock_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  notified: boolean("notified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
