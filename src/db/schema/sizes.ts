import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"

export const sizes = pgTable("sizes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Medium"
  abbreviation: varchar("abbreviation", { length: 10 }), // e.g., "M"
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Clothing", "Home"
})
