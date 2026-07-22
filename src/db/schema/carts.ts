import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"
import { currencyEnum } from "./enums"

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }), // Anonymous cart
  userId: uuid("user_id").references(() => users.id),
  currency: currencyEnum("currency").default("NPR").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("carts_session_id_idx").on(table.sessionId),
  index("carts_user_id_idx").on(table.userId),
])
