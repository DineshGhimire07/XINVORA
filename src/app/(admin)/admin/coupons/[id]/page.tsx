import { notFound } from "next/navigation"
import CouponEditor from "./CouponEditor"
import { db } from "@/db/client"
import { coupons } from "@/db/schema/coupons"
import { eq } from "drizzle-orm"

export default async function AdminCouponEditorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  let coupon = null

  if (id !== "new") {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1)
    if (result.length === 0) {
      notFound()
    }
    coupon = result[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide mb-8">
        {coupon ? "Edit Coupon" : "New Coupon"}
      </h1>
      
      <CouponEditor coupon={coupon} />
    </div>
  )
}
