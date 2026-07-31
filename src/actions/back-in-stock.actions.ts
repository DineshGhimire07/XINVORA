"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/client"
import { backInStockRequests, products } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function notifyBackInStockAction(
  _prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const productId = formData.get("productId")?.toString().trim()
  const name = formData.get("name")?.toString().trim() || ""
  const phone = formData.get("phone")?.toString().trim() || ""

  if (!productId) {
    return { success: false, error: "Missing product ID." }
  }

  if (!name) {
    return { success: false, error: "Please enter your name." }
  }

  if (!phone) {
    return { success: false, error: "Please enter your phone number." }
  }

  try {
    // Fetch product name for admin display
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { name: true },
    })

    await db.insert(backInStockRequests).values({
      productId,
      name,
      phone,
      email: "",
      productName: product?.name || "",
      notified: false,
    })

    revalidatePath("/admin/inquiries")
    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
