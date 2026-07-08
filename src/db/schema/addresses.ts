import { pgTable, uuid, varchar, integer, boolean, doublePrecision, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"
import { nepalProvinces } from "./nepal-provinces"
import { nepalDistricts } from "./nepal-districts"
import { nepalMunicipalities } from "./nepal-municipalities"

/**
 * Nepal-specific delivery address for XINVORA.
 * Replaces the old generic international address schema.
 */
export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

  // Recipient
  fullName: varchar("full_name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),

  // Administrative hierarchy
  provinceId: uuid("province_id").references(() => nepalProvinces.id).notNull(),
  districtId: uuid("district_id").references(() => nepalDistricts.id).notNull(),
  municipalityId: uuid("municipality_id").references(() => nepalMunicipalities.id).notNull(),
  wardNumber: integer("ward_number").notNull(),

  // Location details
  tole: varchar("tole", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }),
  landmark: varchar("landmark", { length: 255 }),
  deliveryNote: varchar("delivery_note", { length: 1000 }),

  // Geolocation (optional — user-granted)
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),

  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("addresses_user_id_idx").on(t.userId),
])
