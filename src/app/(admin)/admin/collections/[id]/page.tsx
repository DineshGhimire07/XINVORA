import { SessionService } from "@/services/session.service"
import { AdminCollectionService } from "@/services/admin.collection.service"
import { notFound } from "next/navigation"
import CollectionEditor from "./CollectionEditor"
import { db } from "@/db/client"
import { collections } from "@/db/schema/collections"
import { products } from "@/db/schema/products"
import { productCollections } from "@/db/schema/product-collections"
import { productImages } from "@/db/schema/product-images"
import { variants } from "@/db/schema/variants"
import { priceBooks } from "@/db/schema/price-books"
import { priceBookEntries } from "@/db/schema/price-book-entries"
import { eq, isNull, ne, and, sql } from "drizzle-orm"

export const metadata = {
  title: "Collection Editor | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCollectionEditorPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  let collection = null
  let selectedProductIds: string[] = []

  if (id !== "new") {
    const result = await db.select().from(collections).where(eq(collections.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    collection = result[0]

    // Fetch currently associated product IDs
    const associated = await db
      .select({ productId: productCollections.productId })
      .from(productCollections)
      .where(eq(productCollections.collectionId, id))
    selectedProductIds = associated.map((a: any) => a.productId)
  }

  // Fetch all active products for the assignment picker with price, createdAt, and thumbnail
  const activeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      createdAt: products.createdAt,
      price: sql<number>`coalesce((
        select min(${priceBookEntries.price}) 
        from ${variants} 
        inner join ${priceBookEntries} on ${variants.id} = ${priceBookEntries.variantId}
        inner join ${priceBooks} on ${priceBookEntries.priceBookId} = ${priceBooks.id}
        where ${variants.productId} = ${products.id} and ${priceBooks.isDefault} = true
      ), 0)`,
      imageUrl: sql<string | null>`(
        select ${productImages.url}
        from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.position} asc
        limit 1
      )`,
    })
    .from(products)
    .where(isNull(products.deletedAt))
    .orderBy(sql`${products.createdAt} desc`)

  // Fetch all collections for parent hierarchy dropdown
  const collectionsQuery = collection
    ? db.select().from(collections).where(and(isNull(collections.deletedAt), ne(collections.id, collection.id)))
    : db.select().from(collections).where(isNull(collections.deletedAt))
  
  const parentCollections = await collectionsQuery
  const template = collection ? await AdminCollectionService.getCollectionTemplate(collection.id) : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {collection ? "Edit Collection" : "New Collection"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure collection details, hierarchy, SEO settings, photography sequence template, and select associated products.
        </p>
      </div>

      <CollectionEditor 
        collection={collection} 
        collections={parentCollections}
        allProducts={activeProducts}
        initialProductIds={selectedProductIds}
        initialTemplate={template}
      />
    </div>
  )
}
