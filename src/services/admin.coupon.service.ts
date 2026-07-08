import "server-only"
import { db } from "@/db/client"
import { insertCoupon, updateCoupon, softDeleteCoupon, restoreCoupon } from "@/db/mutations/coupons"
import { AdminAuditService } from "./admin.audit.service"

export class AdminCouponService {
  static async createCoupon(data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const coupon = await insertCoupon(data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "CREATE",
        entityType: "COUPON",
        entityId: coupon.id,
        newValue: coupon,
      }, tx)

      return coupon
    })
  }

  static async updateCoupon(id: string, data: any, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const coupon = await updateCoupon(id, data, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "UPDATE",
        entityType: "COUPON",
        entityId: id,
        newValue: coupon,
      }, tx)

      return coupon
    })
  }

  static async deleteCoupon(id: string, adminUserId: string) {
    return await db.transaction(async (tx) => {
      const coupon = await softDeleteCoupon(id, tx)

      await AdminAuditService.logAction({
        userId: adminUserId,
        action: "DELETE",
        entityType: "COUPON",
        entityId: id,
      }, tx)

      return coupon
    })
  }
}
