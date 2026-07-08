"use server"

import { revalidatePath } from "next/cache"
import { AddressService } from "../services/address.service"
import { SessionService } from "../services/session.service"
import type { ActionResult } from "../types/actions"
import { z } from "zod"

const AddressInputSchema = z.object({
  label: z.string().max(100).optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  line1: z.string().min(1, "Address is required").max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional(),
  country: z.string().length(2, "Country must be 2 characters ISO code"),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  phone: z.string().max(50).optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
})

export async function createAddressAction(
  formData: z.infer<typeof AddressInputSchema>
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const validated = AddressInputSchema.parse(formData)

    const newAddress = await AddressService.createAddress(session.id, validated)

    revalidatePath("/account/addresses")
    revalidatePath("/checkout")

    return {
      success: true,
      data: newAddress,
    }
  } catch (error: any) {
    console.error("[createAddressAction Error]:", error)
    return {
      success: false,
      error: {
        code: "ADDRESS_CREATE_ERROR",
        message: error.message || "Failed to save address details.",
      },
    }
  }
}

export async function updateAddressAction(
  id: string,
  formData: z.infer<typeof AddressInputSchema>
): Promise<ActionResult<any>> {
  try {
    const session = await SessionService.requireAuth()
    const validated = AddressInputSchema.parse(formData)

    const updated = await AddressService.updateAddress(session.id, id, validated)

    revalidatePath("/account/addresses")
    revalidatePath("/checkout")

    return {
      success: true,
      data: updated,
    }
  } catch (error: any) {
    console.error("[updateAddressAction Error]:", error)
    return {
      success: false,
      error: {
        code: "ADDRESS_UPDATE_ERROR",
        message: error.message || "Failed to update address details.",
      },
    }
  }
}

export async function deleteAddressAction(id: string): Promise<ActionResult<void>> {
  try {
    const session = await SessionService.requireAuth()
    await AddressService.deleteAddress(session.id, id)

    revalidatePath("/account/addresses")
    revalidatePath("/checkout")

    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[deleteAddressAction Error]:", error)
    return {
      success: false,
      error: {
        code: "ADDRESS_DELETE_ERROR",
        message: error.message || "Failed to remove address.",
      },
    }
  }
}
