import { notFound } from "next/navigation"
import BrandEditor from "./BrandEditor"
import { db } from "@/db/client"
import { brands } from "@/db/schema/brands"
import { eq } from "drizzle-orm"

export default async function AdminBrandEditorPage(props: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {brand ? "Edit Brand" : "New Brand"}
      </h1>
      
      <BrandEditor brand={brand} />
    </div>
  )
}
