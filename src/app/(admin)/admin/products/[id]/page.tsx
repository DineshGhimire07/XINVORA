import { findAdminProductsPaginated } from "@/db/queries/products"
import { notFound } from "next/navigation"
import ProductEditor from "./ProductEditor"
import { db } from "@/db/client"
import { products } from "@/db/schema/products"
import { categories } from "@/db/schema/categories"
import { brands } from "@/db/schema/brands"
import { mediaLibrary } from "@/db/schema/media"
import { productImages } from "@/db/schema/product-images"
import { variants } from "@/db/schema/variants"
import { priceBookEntries } from "@/db/schema/price-book-entries"
import { collections } from "@/db/schema/collections"
import { materials } from "@/db/schema/materials"
import { inventory } from "@/db/schema/inventory"
import { productCollections } from "@/db/schema/product-collections"
import { productMaterials } from "@/db/schema/product-materials"
import { eq, isNull } from "drizzle-orm"

import { sizes } from "@/db/schema/sizes"

export default async function AdminProductEditorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  let product: any = null

  if (id !== "create" && id !== "new") {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    
    const imagesResult = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.position)
    
    const variantResult = await db.select().from(variants).where(eq(variants.productId, id)).limit(1)
    let basePrice = ""
    let stockQuantity = 0
    if (variantResult.length > 0) {
      const priceResult = await db.select().from(priceBookEntries).where(eq(priceBookEntries.variantId, variantResult[0].id)).limit(1)
      if (priceResult.length > 0) {
        basePrice = (priceResult[0].price / 100).toString()
      }
      
      const inventoryResult = await db.select().from(inventory).where(eq(inventory.variantId, variantResult[0].id)).limit(1)
      if (inventoryResult.length > 0) {
        stockQuantity = inventoryResult[0].quantity
      }
    }
    
    const collectionsResult = await db.select().from(productCollections).where(eq(productCollections.productId, id))
    const materialsResult = await db.select().from(productMaterials).where(eq(productMaterials.productId, id))

    // Query variant sizes and colors if there are variants
    const allVariants = await db.select().from(variants).where(eq(variants.productId, id))
    const sizeInventories: Record<string, number> = {}
    for (const v of allVariants) {
      if (v.sizeId) {
        const inv = await db.select().from(inventory).where(eq(inventory.variantId, v.id)).limit(1)
        if (inv.length > 0) {
          sizeInventories[v.sizeId] = inv[0].quantity
        }
      }
    }

    product = {
      ...result[0],
      images: imagesResult.map(i => i.url),
      collectionIds: collectionsResult.map(c => c.collectionId),
      materialIds: materialsResult.map(m => m.materialId),
      basePrice,
      stockQuantity,
      sizeInventories
    }
  }

  const allCategories = await db.select().from(categories).where(isNull(categories.deletedAt))
  const allBrands = await db.select().from(brands).where(isNull(brands.deletedAt))
  const mediaItems = await db.select().from(mediaLibrary).where(isNull(mediaLibrary.deletedAt))
  const allCollections = await db.select().from(collections)
  const allMaterials = await db.select().from(materials)
  const allSizes = await db.select().from(sizes)

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {product ? "Edit Product" : "New Product"}
      </h1>
      
      <ProductEditor 
        product={product} 
        categories={allCategories} 
        brands={allBrands} 
        mediaItems={mediaItems} 
        collections={allCollections}
        materials={allMaterials}
        sizes={allSizes}
      />
    </div>
  )
}
