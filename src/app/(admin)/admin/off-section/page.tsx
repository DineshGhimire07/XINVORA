import { SessionService } from "@/services/session.service"
import { findOffSectionProducts } from "@/db/queries/off-section"
import { db } from "@/db/client"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { OffSectionClient } from "./OffSectionClient"

export const metadata = {
  title: "Off Section | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
    categoryId?: string
  }>
}

export default async function AdminOffSectionPage(props: PageProps) {
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const status = (searchParams.status as "active" | "inactive" | "all") || "all"
  const categoryId = searchParams.categoryId || ""

  // Fetch Off Section data
  const offSectionData = await findOffSectionProducts({
    page,
    limit: 20,
    search: search || undefined,
    status,
    categoryId: categoryId || undefined,
  })

  // Fetch all categories for filter dropdown
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    columns: { id: true, name: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  })

  // Fetch all published products for Add Product modal
  const allProducts = await db.query.products.findMany({
    where: eq((await import("@/db/schema")).products.status, "PUBLISHED"),
    columns: { id: true, name: true, slug: true },
    with: {
      productImages: {
        where: (img, { eq }) => eq(img.position, 0),
        limit: 1,
        columns: { url: true },
      },
    },
    orderBy: (p, { asc }) => [asc(p.name)],
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Off Section
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1.5 max-w-xl leading-relaxed">
            Manage products that display an original price, discounted selling price
            and OFF badge throughout the storefront.
          </p>
        </div>
      </div>

      <OffSectionClient
        offSectionData={offSectionData}
        allProducts={allProducts}
        allCategories={allCategories}
        currentSearch={search}
        currentStatus={status}
        currentCategoryId={categoryId}
      />
    </div>
  )
}
