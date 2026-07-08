import { pgTable, uuid, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core"
import { discountTypeEnum } from "./enums"

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(), // amount in cents or percentage (e.g., 1000 = $10.00, or 20 = 20%)
  
  minOrderAmount: integer("min_order_amount"),
  maxDiscountAmount: integer("max_discount_amount"), // useful for capping percentage discounts
  
  maxUses: integer("max_uses"),
  usesPerUser: integer("uses_per_user").default(1),
  currentUses: integer("current_uses").default(0).notNull(),
  
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  
  isActive: boolean("is_active").default(true).notNull(),
  
  applicableCategories: jsonb("applicable_categories"), // future array of category IDs
  applicableProducts: jsonb("applicable_products"), // future array of product IDs
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})
