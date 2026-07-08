import { notFound } from "next/navigation"
import CollectionEditor from "./CollectionEditor"
import { db } from "@/db/client"
import { collections } from "@/db/schema/collections"
import { eq } from "drizzle-orm"

export default async function AdminCollectionEditorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  let collection = null

  const allCollections = await db.select().from(collections)

  if (id !== "new") {
    const result = allCollections.find(c => c.id === id)
    if (!result) {
      notFound()
    }
    collection = result
  }

  // Prevent circular dependency in parent select
  const validParents = allCollections.filter(c => c.id !== id)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {collection ? "Edit Collection" : "New Collection"}
      </h1>
      
      <CollectionEditor collection={collection} collections={validParents} />
    </div>
  )
}
