"use server"

import { createBackInStockRequest } from "@/services/back-in-stock.service"

export async function notifyBackInStockAction(
  _prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email")?.toString().trim()
  const productId = formData.get("productId")?.toString().trim()

  if (!email || !productId) {
    return { success: false, error: "Missing email or product." }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." }
  }

  try {
    await createBackInStockRequest(productId, email)
    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
