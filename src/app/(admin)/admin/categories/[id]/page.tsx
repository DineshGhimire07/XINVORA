import { notFound } from "next/navigation"
import CategoryEditor from "./CategoryEditor"
import { db } from "@/db/client"
import { categories } from "@/db/schema/categories"
import { eq } from "drizzle-orm"

export default async function AdminCategoryEditorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  let category = null

  if (id !== "new") {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    category = result[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {category ? "Edit Category" : "New Category"}
      </h1>
      
      <CategoryEditor category={category} />
    </div>
  )
}
