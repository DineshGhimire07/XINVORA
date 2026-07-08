import { pgTable, uuid, varchar, integer, pgEnum, index } from "drizzle-orm/pg-core"
import { nepalDistricts } from "./nepal-districts"

export const municipalityTypeEnum = pgEnum("municipality_type", [
  "METROPOLITAN",
  "SUBMETROPOLITAN",
  "MUNICIPALITY",
  "RURAL_MUNICIPALITY",
])

export const nepalMunicipalities = pgTable("nepal_municipalities", {
  id: uuid("id").defaultRandom().primaryKey(),
  districtId: uuid("district_id").notNull().references(() => nepalDistricts.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 150 }).notNull(),
  type: municipalityTypeEnum("type").notNull(),
  totalWards: integer("total_wards").notNull().default(9),
}, (t) => [
  index("nepal_municipalities_district_id_idx").on(t.districtId),
])
