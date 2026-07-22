import { SessionService } from "@/services/session.service"
import { JournalRepository } from "@/db/repositories/journal.repository"
import { db } from "@/db/client"
import { products } from "@/db/schema/products"
import { collections } from "@/db/schema/collections"
import { mediaLibrary } from "@/db/schema/media"
import { isNull, desc } from "drizzle-orm"
import { JournalEditorClient } from "../[id]/JournalEditorClient"

export const metadata = {
  title: "Create Article | Admin | XINVORA",
}

export default async function CreateJournalPage() {
  await SessionService.requireAdmin()

  const [categories, allProducts, allCollections, mediaItems] = await Promise.all([
    JournalRepository.findAllCategories(),
    db.select({ id: products.id, name: products.name, slug: products.slug }).from(products).where(isNull(products.deletedAt)),
    db.select({ id: collections.id, name: collections.name, slug: collections.slug }).from(collections).where(isNull(collections.deletedAt)),
    db.select().from(mediaLibrary).where(isNull(mediaLibrary.deletedAt)).orderBy(desc(mediaLibrary.createdAt)),
  ])

  return (
    <JournalEditorClient
      categories={categories}
      allProducts={allProducts}
      allCollections={allCollections}
      mediaItems={mediaItems}
    />
  )
}
