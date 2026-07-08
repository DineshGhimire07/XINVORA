"use server"

import { revalidatePath } from "next/cache"
import { InquiryService } from "../services/inquiry.service"
import type { ActionResult } from "../types/actions"
import { z } from "zod"

const submitInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitInquiryAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }
    
    const validated = submitInquirySchema.parse(rawData)
    
    await InquiryService.submitInquiry(validated)

    return {
      success: true,
      data: { success: true }
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues?.[0]?.message || "Validation failed",
          fieldErrors: error.flatten ? error.flatten().fieldErrors : {},
        }
      }
    }
    console.error("[submitInquiryAction Error]:", error)
    return {
      success: false,
      error: {
        code: "INQUIRY_SUBMIT_ERROR",
        message: error.message || "Failed to submit inquiry."
      }
    }
  }
}

export async function updateInquiryStatusAction(
  id: string,
  status: 'NEW' | 'READ' | 'RESPONDED'
): Promise<ActionResult<any>> {
  try {
    await InquiryService.updateInquiryStatus(id, status)
    revalidatePath("/admin/inquiries")
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error("[updateInquiryStatusAction Error]:", error)
    return {
      success: false,
      error: {
        code: "INQUIRY_UPDATE_ERROR",
        message: error.message || "Failed to update status."
      }
    }
  }
}
