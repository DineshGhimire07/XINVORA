import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import CategoryEditor from "./CategoryEditor"
import { db } from "@/db/client"
import { categories } from "@/db/schema/categories"
import { eq } from "drizzle-orm"

export const metadata = {
  title: "Category Editor | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCategoryEditorPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {category ? "Edit Category" : "New Category"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure category titles, taxonomy identifiers, and descriptions.
        </p>
      </div>

      <CategoryEditor category={category} />
    </div>
  )
}
