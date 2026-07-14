import { relations } from "drizzle-orm"
import { products } from "./products"
import { categories } from "./categories"
import { brands } from "./brands"
import { variants } from "./variants"
import { attributes } from "./attributes"
import { attributeValues } from "./attribute-values"
import { productImages } from "./product-images"
import { productTags } from "./product-tags"
import { productCollections } from "./product-collections"
import { productMaterials } from "./product-materials"
import { materials } from "./materials"
import { inventory } from "./inventory"
import { variantImages } from "./variant-images"
import { colors } from "./colors"
import { collections } from "./collections"
import { sizes } from "./sizes"
import { nepalProvinces } from "./nepal-provinces"
import { nepalDistricts } from "./nepal-districts"
import { nepalMunicipalities } from "./nepal-municipalities"
import { addresses } from "./addresses"
import { users } from "./users"
import { orders } from "./orders"
import { orderItems } from "./order-items"
import { orderActivity } from "./order-activity"
export const collectionsRelations = relations(collections, ({ one, many }) => ({
  parent: one(collections, {
    fields: [collections.parentId],
    references: [collections.id],
    relationName: "collection_hierarchy",
  }),
  children: many(collections, {
    relationName: "collection_hierarchy",
  }),
  productCollections: many(productCollections),
}))
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  variants: many(variants),
  productImages: many(productImages),
  productTags: many(productTags),
  productCollections: many(productCollections),
  productMaterials: many(productMaterials),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_hierarchy",
  }),
  children: many(categories, {
    relationName: "category_hierarchy",
  }),
  products: many(products),
}))

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}))

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [variants.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [variants.sizeId],
    references: [sizes.id],
  }),
  inventory: one(inventory, {
    fields: [variants.id],
    references: [inventory.variantId],
  }),
  variantImages: many(variantImages),
}))

export const colorsRelations = relations(colors, ({ many }) => ({
  variants: many(variants),
}))

export const sizesRelations = relations(sizes, ({ many }) => ({
  variants: many(variants),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const inventoryRelations = relations(inventory, ({ one }) => ({
  variant: one(variants, {
    fields: [inventory.variantId],
    references: [variants.id],
  }),
}))

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  variant: one(variants, {
    fields: [variantImages.variantId],
    references: [variants.id],
  }),
}))

import { cmsPages, cmsSections, cmsBlocks } from "./cms"
import { navigationMenus, menuItems } from "./navigation"

export const cmsPagesRelations = relations(cmsPages, ({ many }) => ({
  sections: many(cmsSections),
}))

export const cmsSectionsRelations = relations(cmsSections, ({ one, many }) => ({
  page: one(cmsPages, {
    fields: [cmsSections.pageId],
    references: [cmsPages.id],
  }),
  blocks: many(cmsBlocks),
}))

export const cmsBlocksRelations = relations(cmsBlocks, ({ one }) => ({
  section: one(cmsSections, {
    fields: [cmsBlocks.sectionId],
    references: [cmsSections.id],
  }),
}))

export const navigationMenusRelations = relations(navigationMenus, ({ many }) => ({
  items: many(menuItems),
}))

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  menu: one(navigationMenus, {
    fields: [menuItems.menuId],
    references: [navigationMenus.id],
  }),
  parent: one(menuItems, {
    fields: [menuItems.parentId],
    references: [menuItems.id],
    relationName: "menu_hierarchy",
  }),
  children: many(menuItems, {
    relationName: "menu_hierarchy",
  }),
}))

export const productMaterialsRelations = relations(productMaterials, ({ one }) => ({
  product: one(products, {
    fields: [productMaterials.productId],
    references: [products.id],
  }),
  material: one(materials, {
    fields: [productMaterials.materialId],
    references: [materials.id],
  }),
}))

export const materialsRelations = relations(materials, ({ many }) => ({
  productMaterials: many(productMaterials),
}))

// ── Nepal Administrative Relations ──────────────────────────────────────────

export const nepalProvincesRelations = relations(nepalProvinces, ({ many }) => ({
  districts: many(nepalDistricts),
  addresses: many(addresses),
}))

export const nepalDistrictsRelations = relations(nepalDistricts, ({ one, many }) => ({
  province: one(nepalProvinces, {
    fields: [nepalDistricts.provinceId],
    references: [nepalProvinces.id],
  }),
  municipalities: many(nepalMunicipalities),
  addresses: many(addresses),
}))

export const nepalMunicipalitiesRelations = relations(nepalMunicipalities, ({ one, many }) => ({
  district: one(nepalDistricts, {
    fields: [nepalMunicipalities.districtId],
    references: [nepalDistricts.id],
  }),
  addresses: many(addresses),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  province: one(nepalProvinces, {
    fields: [addresses.provinceId],
    references: [nepalProvinces.id],
  }),
  district: one(nepalDistricts, {
    fields: [addresses.districtId],
    references: [nepalDistricts.id],
  }),
  municipality: one(nepalMunicipalities, {
    fields: [addresses.municipalityId],
    references: [nepalMunicipalities.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  orderActivity: many(orderActivity),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(variants, {
    fields: [orderItems.variantId],
    references: [variants.id],
  }),
}))

export const orderActivityRelations = relations(orderActivity, ({ one }) => ({
  order: one(orders, {
    fields: [orderActivity.orderId],
    references: [orders.id],
  }),
  admin: one(users, {
    fields: [orderActivity.performedBy],
    references: [users.id],
  }),
}))

export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}))

export const attributeValuesRelations = relations(attributeValues, ({ one }) => ({
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
}))

