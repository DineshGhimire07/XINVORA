import { notFound } from "next/navigation"
import { SessionService } from "@/services/session.service"
import { JournalRepository } from "@/db/repositories/journal.repository"
import { db } from "@/db/client"
import { products } from "@/db/schema/products"
import { collections } from "@/db/schema/collections"
import { mediaLibrary } from "@/db/schema/media"
import { isNull, desc } from "drizzle-orm"
import { JournalEditorClient } from "./JournalEditorClient"

export const metadata = {
  title: "Edit Article | Admin | XINVORA",
}

interface EditJournalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditJournalPage({ params }: EditJournalPageProps) {
  await SessionService.requireAdmin()
  const resolvedParams = await params

  const [post, categories, allProducts, allCollections, mediaItems, analytics] = await Promise.all([
    JournalRepository.findPostById(resolvedParams.id),
    JournalRepository.findAllCategories(),
    db.select({ id: products.id, name: products.name, slug: products.slug }).from(products).where(isNull(products.deletedAt)),
    db.select({ id: collections.id, name: collections.name, slug: collections.slug }).from(collections).where(isNull(collections.deletedAt)),
    db.select().from(mediaLibrary).where(isNull(mediaLibrary.deletedAt)).orderBy(desc(mediaLibrary.createdAt)),
    JournalRepository.getAttributionAnalytics(resolvedParams.id),
  ])

  if (!post) {
    notFound()
  }

  return (
    <JournalEditorClient
      post={post}
      analytics={analytics}
      categories={categories}
      allProducts={allProducts}
      allCollections={allCollections}
      mediaItems={mediaItems}
    />
  )
}
