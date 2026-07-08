import { notFound } from "next/navigation"
import MaterialEditor from "./MaterialEditor"
import { db } from "@/db/client"
import { materials } from "@/db/schema/materials"
import { eq } from "drizzle-orm"

export default async function AdminMaterialEditorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  let material = null

  if (id !== "new") {
    const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    material = result[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {material ? "Edit Material" : "New Material"}
      </h1>
      
      <MaterialEditor material={material} />
    </div>
  )
}
