import { findAdminInventoryPaginated, getInventoryStats } from "@/db/queries/inventory"
import { db } from "@/db/client"
import { categories } from "@/db/schema"
import { isNull } from "drizzle-orm"
import { InventoryClient } from "./InventoryClient"

export const metadata = {
  title: "Master Inventory Hub | XINVORA Admin",
  description: "Manage product stock levels, variants, and warehouse availability.",
}

export default async function AdminInventoryPage(props: {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    categoryId?: string
    sortBy?: "stockQuantity" | "updatedAt" | "productName" | "sku"
    sortOrder?: "asc" | "desc"
  }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const status = searchParams.status || ""
  const categoryId = searchParams.categoryId || ""
  const sortBy = searchParams.sortBy || "updatedAt"
  const sortOrder = searchParams.sortOrder || "desc"

  const [result, stats, allCategories] = await Promise.all([
    findAdminInventoryPaginated({
      page,
      limit: 30,
      search,
      status,
      categoryId,
      sortBy,
      sortOrder,
    }),
    getInventoryStats(),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(isNull(categories.deletedAt))
      .orderBy(categories.name),
  ])

  return (
    <InventoryClient
      initialItems={result.items as any}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={result.currentPage}
      stats={stats}
      categories={allCategories}
      currentSearch={search}
      currentStatus={status}
      currentCategory={categoryId}
      currentSortBy={sortBy}
      currentSortOrder={sortOrder}
    />
  )
}
