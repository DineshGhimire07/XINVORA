import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import CollectionEditor from "./CollectionEditor"
import { db } from "@/db/client"
import { collections } from "@/db/schema/collections"
import { products } from "@/db/schema/products"
import { productCollections } from "@/db/schema/product-collections"
import { eq, isNull, ne, and } from "drizzle-orm"

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

  // Fetch all active products for the assignment picker
  const activeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
    })
    .from(products)
    .where(isNull(products.deletedAt))
    .orderBy(products.name)

  // Fetch all collections for parent hierarchy dropdown
  const collectionsQuery = collection
    ? db.select().from(collections).where(and(isNull(collections.deletedAt), ne(collections.id, collection.id)))
    : db.select().from(collections).where(isNull(collections.deletedAt))
  
  const parentCollections = await collectionsQuery

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {collection ? "Edit Collection" : "New Collection"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure collection details, hierarchy, SEO settings, and select associated products.
        </p>
      </div>

      <CollectionEditor 
        collection={collection} 
        collections={parentCollections}
        allProducts={activeProducts}
        initialProductIds={selectedProductIds}
      />
    </div>
  )
}
