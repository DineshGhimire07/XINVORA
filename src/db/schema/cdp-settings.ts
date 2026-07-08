import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core"

export const cdpSettings = pgTable("cdp_settings", {
  key: varchar("key", { length: 50 }).primaryKey(),
  value: varchar("value", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
