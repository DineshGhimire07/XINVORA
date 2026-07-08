import { pgTable, uuid, varchar, integer, index } from "drizzle-orm/pg-core"

export const nepalProvinces = pgTable("nepal_provinces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  index("nepal_provinces_sort_order_idx").on(t.sortOrder),
])
