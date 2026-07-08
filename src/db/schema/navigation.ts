import { pgTable, uuid, timestamp, varchar, integer, AnyPgColumn, pgEnum } from "drizzle-orm/pg-core"

export const menuStatusEnum = pgEnum("menu_status", ["DRAFT", "PUBLISHED", "ARCHIVED"])

export const navigationMenus = pgTable("navigation_menus", {
  id: uuid("id").primaryKey().defaultRandom(),
  handle: varchar("handle", { length: 100 }).notNull().unique(), // e.g. "main-menu", "footer-menu"
  name: varchar("name", { length: 255 }).notNull(),
  status: menuStatusEnum("status").notNull().default("DRAFT"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuId: uuid("menu_id").notNull().references(() => navigationMenus.id),
  parentId: uuid("parent_id").references((): AnyPgColumn => menuItems.id), // self-referential
  label: varchar("label", { length: 255 }).notNull(),
  url: varchar("url", { length: 1024 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
