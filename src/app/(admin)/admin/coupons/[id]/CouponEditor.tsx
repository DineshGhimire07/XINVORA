"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCouponAction, updateCouponAction, archiveCouponAction } from "@/actions/admin/coupons.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CouponEditor({ coupon }: { coupon?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (coupon) {
      result = await updateCouponAction(coupon.id, formData)
    } else {
      result = await createCouponAction(formData)
    }

    if (result.success) {
      router.push("/admin/coupons")
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleArchive = async () => {
    if (!coupon) return
    if (!confirm("Are you sure you want to archive this coupon?")) return
    
    setIsLoading(true)
    const result = await archiveCouponAction(coupon.id)
    if (result.success) {
      router.push("/admin/coupons")
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-none border-border-primary/40 bg-surface">
      <CardContent className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-body-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              Coupon Code
            </label>
            <input 
              id="code"
              name="code" 
              defaultValue={coupon?.code}
              required
              className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors uppercase"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="discountType" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Discount Type
              </label>
              <select 
                id="discountType"
                name="discountType" 
                defaultValue={coupon?.discountType || "PERCENTAGE"}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="discountValue" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Discount Value
              </label>
              <input 
                id="discountValue"
                name="discountValue" 
                type="number"
                step="0.01"
                defaultValue={coupon?.discountValue}
                required
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="startsAt" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Valid From
              </label>
              <input 
                id="startsAt"
                name="startsAt" 
                type="datetime-local"
                defaultValue={coupon?.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : ""}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="endsAt" className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                Valid Until
              </label>
              <input 
                id="endsAt"
                name="endsAt" 
                type="datetime-local"
                defaultValue={coupon?.endsAt ? new Date(coupon.endsAt).toISOString().slice(0, 16) : ""}
                className="px-4 py-2 bg-surface-secondary/50 border border-border/40 text-text-primary text-body-sm focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
            {coupon ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isLoading}
                className="text-red-600 text-body-sm underline tracking-wide hover:text-red-800 transition-colors"
              >
                Archive Coupon
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/coupons")}
                disabled={isLoading}
                className="text-text-secondary text-body-sm tracking-wide hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-text-primary text-surface px-8 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors"
              >
                {isLoading ? "Saving..." : "Save Coupon"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
