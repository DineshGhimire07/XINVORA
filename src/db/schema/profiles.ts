import { pgTable, uuid, varchar, timestamp, boolean, date, integer } from "drizzle-orm/pg-core"
import { users } from "./users"
import { accountStatusEnum, verificationStatusEnum, customerTierEnum } from "./enums"

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  profileImage: varchar("profile_image", { length: 500 }),
  newsletterPreference: boolean("newsletter_preference").default(false).notNull(),
  languagePreference: varchar("language_preference", { length: 10 }).default("en").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  
  // Analytics & CRM properties
  accountStatus: accountStatusEnum("account_status").default("ACTIVE").notNull(),
  verificationStatus: verificationStatusEnum("verification_status").default("UNVERIFIED").notNull(),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  customerTier: customerTierEnum("customer_tier").default("BRONZE").notNull(),
  marketingSource: varchar("marketing_source", { length: 100 }),
  referralSource: varchar("referral_source", { length: 100 }),
  cachedSegment: varchar("cached_segment", { length: 50 }),
  riskScore: integer("risk_score").default(0).notNull(),
  fraudFlag: boolean("fraud_flag").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
