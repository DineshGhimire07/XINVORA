import { pgTable, uuid, varchar, timestamp, index, unique } from "drizzle-orm/pg-core"
import { attributes } from "./attributes"

export const attributeValues = pgTable("attribute_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  attributeId: uuid("attribute_id")
    .references(() => attributes.id, { onDelete: "cascade" })
    .notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("attribute_values_attribute_id_idx").on(table.attributeId),
  unique("attribute_value_unique_idx").on(table.attributeId, table.value),
])
