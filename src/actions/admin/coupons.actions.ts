"use server"

import { revalidatePath } from "next/cache"
import { AdminCouponService } from "@/services/admin.coupon.service"
import { SessionService } from "@/services/session.service"
import { z } from "zod"

const couponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().or(z.string().transform(Number)),
  maxUses: z.number().or(z.string().transform(Number)).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

export async function createCouponAction(formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      code: formData.get("code"),
      discountType: formData.get("discountType"),
      discountValue: formData.get("discountValue"),
      maxUses: formData.get("maxUses") || undefined,
      startsAt: formData.get("startsAt") || undefined,
      endsAt: formData.get("endsAt") || undefined,
    }

    const data = couponSchema.parse(rawData)

    await AdminCouponService.createCoupon({
      ...data,
      discountValue: data.discountValue.toString(),
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    }, session.id)

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon" }
  }
}

export async function updateCouponAction(id: string, formData: FormData) {
  try {
    const session = await SessionService.requireAdmin()

    const rawData = {
      code: formData.get("code"),
      discountType: formData.get("discountType"),
      discountValue: formData.get("discountValue"),
      maxUses: formData.get("maxUses") || undefined,
      startsAt: formData.get("startsAt") || undefined,
      endsAt: formData.get("endsAt") || undefined,
    }

    const data = couponSchema.parse(rawData)

    await AdminCouponService.updateCoupon(id, {
      ...data,
      discountValue: data.discountValue.toString(),
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    }, session.id)

    revalidatePath("/admin/coupons")
    revalidatePath(`/admin/coupons/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update coupon" }
  }
}

export async function archiveCouponAction(id: string) {
  try {
    const session = await SessionService.requireAdmin()
    await AdminCouponService.deleteCoupon(id, session.id)
    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive coupon" }
  }
}
