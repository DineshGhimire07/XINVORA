import { SessionService } from "@/services/session.service"
import { findAdminProductsPaginated } from "@/db/queries/products"
import { ProductsClient } from "./ProductsClient"
import Link from "react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Products | XINVORA Admin",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
  }>
}

export default async function AdminProductsPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const limit = 20
  const search = searchParams.search || ""
  const status = searchParams.status || "all"

  const productsData = await findAdminProductsPaginated({
    page,
    limit,
    search,
    status: status !== "all" ? status.toUpperCase() : undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Products
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Manage your product inventory, specifications, and variants.
          </p>
        </div>
        <div>
          <a
            href="/admin/products/create"
            className="inline-flex items-center justify-center bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            + Add Product
          </a>
        </div>
      </div>

      <ProductsClient
        productsData={productsData}
        currentStatusTab={status}
        currentSearch={search}
      />
    </div>
  )
}
