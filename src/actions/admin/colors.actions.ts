"use server"

import { revalidatePath } from "next/cache"
import { SessionService } from "@/services/session.service"
import { db } from "@/db/client"
import { colors } from "@/db/schema"
import { AdminAuditService } from "@/services/admin.audit.service"
import { ilike, eq } from "drizzle-orm"
import { z } from "zod"

const colorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  hexCode: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid HEX color format (e.g. #000000)"),
})

export async function createColorAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    let hexCode = (formData.get("hexCode") as string)?.trim()

    if (!name) {
      return { success: false, error: "Color name is required." }
    }

    if (hexCode && !hexCode.startsWith("#")) {
      hexCode = `#${hexCode}`
    }

    if (!hexCode) {
      hexCode = "#000000"
    }

    const data = colorSchema.parse({ name, hexCode })

    // Check if color with same name already exists (case-insensitive)
    const existing = await db
      .select()
      .from(colors)
      .where(ilike(colors.name, data.name))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: true,
        data: JSON.parse(JSON.stringify(existing[0])),
        message: "Color already exists.",
      }
    }

    const [newColor] = await db
      .insert(colors)
      .values({
        name: data.name,
        hexCode: data.hexCode.toUpperCase(),
      })
      .returning()

    await AdminAuditService.logAction({
      userId: session.id,
      action: "CREATE",
      entityType: "COLOR",
      entityId: newColor.id,
      newValue: newColor,
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newColor)),
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create color." }
  }
}

export async function deleteColorAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()

    const existing = await db.select().from(colors).where(eq(colors.id, id)).limit(1)
    if (existing.length === 0) {
      return { success: false, error: "Color not found." }
    }

    await db.delete(colors).where(eq(colors.id, id))

    await AdminAuditService.logAction({
      userId: session.id,
      action: "DELETE",
      entityType: "COLOR",
      entityId: id,
      oldValue: existing[0],
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete color." }
  }
}

export async function getColorsAction() {
  try {
    await SessionService.requireAdmin()
    const allColors = await db.select().from(colors)
    return {
      success: true,
      data: JSON.parse(JSON.stringify(allColors)),
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch colors." }
  }
}
