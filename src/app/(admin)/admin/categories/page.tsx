import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { categories } from "@/db/schema/categories"
import { isNull, desc } from "drizzle-orm"
import { CategoriesClient } from "./CategoriesClient"

export const metadata = {
  title: "Categories | XINVORA Admin",
}

export default async function AdminCategoriesPage() {
  // Gate check
  await SessionService.requireAdmin()

  const allCategories = await db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(desc(categories.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Categories
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Organize and classify product listings in your store taxonomy.
          </p>
        </div>
        <div>
          <a
            href="/admin/categories/new"
            className="inline-flex items-center justify-center bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            + Add Category
          </a>
        </div>
      </div>

      <CategoriesClient categories={allCategories} />
    </div>
  )
}
