import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { collections } from "@/db/schema/collections"
import { productCollections } from "@/db/schema/product-collections"
import { isNull, desc, eq, sql } from "drizzle-orm"
import { CollectionsClient } from "./CollectionsClient"

export const metadata = {
  title: "Collections | XINVORA Admin",
}

export default async function AdminCollectionsPage() {
  // Gate check
  await SessionService.requireAdmin()

  const allCollections = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      imageUrl: collections.imageUrl,
      bannerUrl: collections.bannerUrl,
      isActive: collections.isActive,
      sortOrder: collections.sortOrder,
      productCount: sql<number>`count(${productCollections.productId})::int`,
    })
    .from(collections)
    .leftJoin(productCollections, eq(collections.id, productCollections.collectionId))
    .where(isNull(collections.deletedAt))
    .groupBy(collections.id, collections.name, collections.slug, collections.imageUrl, collections.bannerUrl, collections.isActive, collections.sortOrder)
    .orderBy(desc(collections.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          Collections
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Group products to build custom curated lists for storefront navigations and campaigns.
        </p>
      </div>

      <CollectionsClient collections={allCollections} />
    </div>
  )
}

