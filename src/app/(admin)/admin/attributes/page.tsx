import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { attributes } from "@/db/schema/attributes"
import { attributeValues } from "@/db/schema/attribute-values"
import { eq, sql } from "drizzle-orm"
import { AttributesClient } from "./AttributesClient"

export const metadata = {
  title: "Attributes | XINVORA Admin",
}

export default async function AdminAttributesPage() {
  // Gate check
  await SessionService.requireAdmin()

  const allAttributes = await db
    .select({
      id: attributes.id,
      name: attributes.name,
      valuesList: sql<string>`coalesce(string_agg(${attributeValues.value}, ', ' order by ${attributeValues.value}), '')`,
    })
    .from(attributes)
    .leftJoin(attributeValues, eq(attributes.id, attributeValues.attributeId))
    .groupBy(attributes.id, attributes.name)
    .orderBy(attributes.name)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
            Attributes
          </h1>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Configure product dimensions and custom descriptive fields (e.g. Fit, Material, Style).
          </p>
        </div>
        <div>
          <a
            href="/admin/attributes/new"
            className="inline-flex items-center justify-center bg-admin-primary text-admin-primary-on hover:bg-admin-primary/95 px-4 py-2 text-admin-xs font-bold uppercase tracking-wider rounded-admin-md transition-colors"
          >
            + Add Attribute
          </a>
        </div>
      </div>

      <AttributesClient attributes={allAttributes} />
    </div>
  )
}
