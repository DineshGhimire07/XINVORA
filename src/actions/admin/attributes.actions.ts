"use server"

import { revalidatePath, updateTag } from "next/cache"
import { AdminAttributeService } from "@/services/admin.attribute.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const attributeSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string()).min(1, { message: "Provide at least one value for the attribute" }),
})

export async function createAttributeAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    // Get all input fields named "values"
    const rawValues = formData.getAll("values").map(v => String(v).trim()).filter(Boolean)

    const rawData = {
      name: formData.get("name")?.toString() || "",
      values: rawValues,
    }

    const data = attributeSchema.parse(rawData)

    await AdminAttributeService.createAttribute(data, session.id)

    updateTag("attributes")
    revalidatePath("/admin/attributes")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create attribute" }
  }
}

export async function updateAttributeAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawValues = formData.getAll("values").map(v => String(v).trim()).filter(Boolean)

    const rawData = {
      name: formData.get("name")?.toString() || "",
      values: rawValues,
    }

    const data = attributeSchema.parse(rawData)

    await AdminAttributeService.updateAttribute(id, data, session.id)

    updateTag("attributes")
    revalidatePath("/admin/attributes")
    revalidatePath(`/admin/attributes/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update attribute" }
  }
}

export async function deleteAttributeAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminAttributeService.deleteAttribute(id, session.id)
    updateTag("attributes")
    revalidatePath("/admin/attributes")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete attribute" }
  }
}
