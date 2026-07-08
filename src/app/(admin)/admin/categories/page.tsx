import { db } from "@/db/client"
import { categories } from "@/db/schema/categories"
import { isNull, desc } from "drizzle-orm"
import Link from "next/link"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminCategoriesPage() {
  const allCategories = await db.select().from(categories).where(isNull(categories.deletedAt)).orderBy(desc(categories.createdAt))

  return (
    <Stack gap={8}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
            Categories
          </h1>
          <p className="text-body-sm text-text-secondary mt-2">
            Manage your product taxonomy and catalog structure.
          </p>
        </div>
        <div>
          <Link href="/admin/categories/new">
            <Button className="bg-text-primary text-surface px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors">
              + Add Category
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            Active Categories ({allCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-secondary/30 text-text-secondary border-b border-border-primary/20 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/10">
                {allCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-text-secondary">
                      No categories found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  allCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-mono text-body-xs">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/categories/${category.id}`}
                          className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-text-primary transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Stack>
  )
}
