"use server"

import { revalidatePath } from "next/cache"
import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { sizes } from "@/db/schema"
import { AdminAuditService } from "@/services/admin.audit.service"
import { eq, ilike } from "drizzle-orm"
import { z } from "zod"

const sizeSchema = z.object({
  name: z.string().min(1),
  abbreviation: z.string().max(15).optional(),
  category: z.string().default("CLOTHING"),
})

export async function createSizeAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    const rawAbbr = (formData.get("abbreviation") as string)?.trim()
    const category = (formData.get("category") as string)?.trim() || "CLOTHING"

    if (!name) {
      return { success: false, error: "Size name is required." }
    }

    const abbreviation = rawAbbr || (name.length <= 10 ? name : name.slice(0, 10))

    const data = sizeSchema.parse({ name, abbreviation, category })

    // Check if size already exists (case-insensitive)
    const existing = await db
      .select()
      .from(sizes)
      .where(ilike(sizes.name, data.name))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: true,
        data: existing[0],
        message: "Size already exists."
      }
    }

    const [newSize] = await db
      .insert(sizes)
      .values({
        name: data.name,
        abbreviation: data.abbreviation || data.name,
        category: data.category,
      })
      .returning()

    await AdminAuditService.logAction({
      userId: session.id,
      action: "CREATE",
      entityType: "SIZE",
      entityId: newSize.id,
      newValue: newSize,
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true, data: newSize }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create custom size." }
  }
}
