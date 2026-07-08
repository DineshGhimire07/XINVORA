import { pgTable, uuid, varchar, index } from "drizzle-orm/pg-core"
import { nepalProvinces } from "./nepal-provinces"

export const nepalDistricts = pgTable("nepal_districts", {
  id: uuid("id").defaultRandom().primaryKey(),
  provinceId: uuid("province_id").notNull().references(() => nepalProvinces.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }),
}, (t) => [
  index("nepal_districts_province_id_idx").on(t.provinceId),
])
