import { SessionService } from "@/services/session.service"
import { notFound } from "next/navigation"
import AttributeEditor from "./AttributeEditor"
import { db } from "@/db/client"
import { attributes } from "@/db/schema/attributes"
import { attributeValues } from "@/db/schema/attribute-values"
import { eq } from "drizzle-orm"

export const metadata = {
  title: "Attribute Editor | XINVORA Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminAttributeEditorPage(props: PageProps) {
  // Gate check
  await SessionService.requireAdmin()

  const { id } = await props.params

  let attribute = null

  if (id !== "new") {
    const result = await db.select().from(attributes).where(eq(attributes.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    const values = await db
      .select()
      .from(attributeValues)
      .where(eq(attributeValues.attributeId, id))
      .orderBy(attributeValues.value)

    attribute = {
      ...result[0],
      values,
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
          {attribute ? "Edit Attribute" : "New Attribute"}
        </h1>
        <p className="text-admin-sm text-admin-text-secondary mt-1">
          Configure general attribute types and their selectable option values.
        </p>
      </div>

      <AttributeEditor attribute={attribute} />
    </div>
  )
}
