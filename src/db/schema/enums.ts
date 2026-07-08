/**
 * db/schema/enums.ts — XINVORA Shared Enums
 *
 * Centralized Postgres Enums.
 * By defining these here, the database enforces strict values,
 * and Drizzle infers exact string literal unions for TypeScript.
 */

import { pgEnum } from "drizzle-orm/pg-core"

export const productStatusEnum = pgEnum("product_status", ["DRAFT", "PUBLISHED", "ARCHIVED"])
export const inventoryStatusEnum = pgEnum("inventory_status", ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"])
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PENDING_PAYMENT", 
  "PAYMENT_PENDING_VERIFICATION",
  "PAID", 
  "CONFIRMED",
  "PROCESSING", 
  "PACKED",
  "SHIPPED", 
  "OUT_FOR_DELIVERY",
  "DELIVERED", 
  "CANCELLED", 
  "REFUNDED",
  "FAILED"
])
export const paymentStatusEnum = pgEnum("payment_status", [
  "NEW",
  "INITIATED",
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "EXPIRED"
])
export const paymentProviderEnum = pgEnum("payment_provider", [
  "NONE",
  "KHALTI",
  "ESEWA",
  "STRIPE",
  "PAYPAL",
  "DUMMY",
  "MANUAL",
  "UNKNOWN"
])
export const userRoleEnum = pgEnum("user_role", ["CUSTOMER", "ADMIN"])
export const currencyEnum = pgEnum("currency", ["USD", "EUR", "NPR"])
export const discountTypeEnum = pgEnum("discount_type", ["PERCENTAGE", "FIXED_AMOUNT"])
export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED"])

// We use ISO 3166-1 alpha-2 for countries. Rather than hardcoding 195+ enums,
// we will just use varchar(2) in the schema, but we define a type constraint elsewhere.
// But for strict enums we can use varchar(2). Let's stick to varchar for country codes.

export const accountStatusEnum = pgEnum("account_status", ["ACTIVE", "SUSPENDED", "DELETED"])
export const verificationStatusEnum = pgEnum("verification_status", ["UNVERIFIED", "EMAIL_VERIFIED", "PHONE_VERIFIED", "FULLY_VERIFIED"])
export const customerTierEnum = pgEnum("customer_tier", ["BRONZE", "SILVER", "GOLD", "PLATINUM"])
export const deviceTypeEnum = pgEnum("device_type", ["DESKTOP", "MOBILE", "TABLET"])
export const interactionTypeEnum = pgEnum("interaction_type", ["VIEW", "CART_ADD", "PURCHASE", "WISHLIST", "RETURN"])

