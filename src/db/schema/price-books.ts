import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core"
import { currencyEnum } from "./enums"

export const priceBooks = pgTable("price_books", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "US Retail"
  currency: currencyEnum("currency").notNull(),
  country: varchar("country", { length: 2 }), // ISO 3166-1 alpha-2, nullable
  isDefault: boolean("is_default").default(false).notNull(),
})
