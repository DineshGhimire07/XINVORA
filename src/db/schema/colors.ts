import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"

export const colors = pgTable("colors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Sand"
  hexCode: varchar("hex_code", { length: 7 }).notNull(), // e.g., "#e3d5ca"
})
