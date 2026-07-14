import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { brands } from "@/db/schema/brands"
import { isNull, desc } from "drizzle-orm"
import { BrandsClient } from "./BrandsClient"

export const metadata = {
  title: "Brands | XINVORA Admin",
}

export default async function AdminBrandsPage() {
  // Gate check
  await SessionService.requireAdmin()

  const allBrands = await db
    .select()
    .from(brands)
    .where(isNull(brands.deletedAt))
    .orderBy(desc(brands.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Brands
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Manage product manufacturers, partner brands, and labels.
          </p>
        </div>
        <div>
          <a
            href="/admin/brands/new"
            className="inline-flex items-center justify-center bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            + Add Brand
          </a>
        </div>
      </div>

      <BrandsClient brands={allBrands} />
    </div>
  )
}
