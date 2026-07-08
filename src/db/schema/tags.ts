import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
})
