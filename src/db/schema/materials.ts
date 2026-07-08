import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  deletedAt: timestamp("deleted_at"),
})
