import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import BrandEditor from "./BrandEditor"
import { db } from "@/db/client"
import { brands } from "@/db/schema/brands"
import { eq } from "drizzle-orm"

export const metadata = {
  title: "Brand Editor | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminBrandEditorPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  let brand = null

  if (id !== "new") {
    const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    brand = result[0]
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {brand ? "Edit Brand" : "New Brand"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure manufacturer identifiers, logos, details, and details listings.
        </p>
      </div>

      <BrandEditor brand={brand} />
    </div>
  )
}
