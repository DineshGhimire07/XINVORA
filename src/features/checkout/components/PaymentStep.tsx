"use client"

import React, { useState } from "react"
import { ChevronLeft, Loader2, UploadCloud, CreditCard, Banknote } from "lucide-react"
import { submitCheckoutAction } from "@/actions/checkout.actions"
import { uploadCustomerLocalFileAction } from "@/actions/customer.media.actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function PaymentStep({ addressData, totals, paymentQrs, onBack }: any) {
  const router = useRouter()
  const [method, setMethod] = useState<"COD" | "ESEWA">("COD")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    let paymentProofUrl: string | undefined = undefined
    if (method === "ESEWA") {
      if (!file) {
        setError("Please upload your payment screenshot.")
        setIsSubmitting(false)
        return
      }
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await uploadCustomerLocalFileAction(formData)
      if (uploadRes.success && uploadRes.url) {
        paymentProofUrl = uploadRes.url
      } else {
        setError(uploadRes.error || "Failed to upload payment proof.")
        setIsSubmitting(false)
        return
      }
    }

    const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)

    const result = await submitCheckoutAction({
      ...addressData,
      paymentMethod: method,
      paymentProofUrl,
      idempotencyKey,
      shippingMethodId: totals.shippingMethod.id
    })

    if (result.success) {
      const d = result.data as { orderId: string; orderNumber: string }
      router.push(`/payment/success?orderId=${d.orderId}&orderNumber=${d.orderNumber}`)
    } else {
      setError(result.error?.message || "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Address
        </button>
        
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
          <div className="space-y-4">
            {/* COD Option */}
            <label className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              method === "COD" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
            )}>
              <input 
                type="radio" 
                name="payment"
                checked={method === "COD"}
                onChange={() => setMethod("COD")}
                className="mt-1 w-4 h-4 text-accent accent-accent"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-text-primary">
                  <Banknote className="w-5 h-5 text-green-600" />
                  Cash on Delivery
                </div>
                <p className="text-sm text-text-secondary mt-1">Pay with cash when your order arrives.</p>
              </div>
            </label>

            {/* eSewa Option */}
            <label className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              method === "ESEWA" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
            )}>
              <input 
                type="radio" 
                name="payment"
                checked={method === "ESEWA"}
                onChange={() => setMethod("ESEWA")}
                className="mt-1 w-4 h-4 text-accent accent-accent"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-text-primary">
                  <CreditCard className="w-5 h-5 text-[#61ce70]" />
                  eSewa (Manual Verification)
                </div>
                <p className="text-sm text-text-secondary mt-1">Scan the QR code and upload a screenshot of your successful payment.</p>
                
                {method === "ESEWA" && (
                  <div className="mt-4 pt-4 border-t border-border flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                    <img src={paymentQrs?.esewaUrl || "/esewa-qr.png"} alt="eSewa QR Code" className="w-48 h-48 rounded-lg border shadow-sm mb-4 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.insertAdjacentHTML('afterbegin', '<div class="w-48 h-48 bg-surface-secondary border border-dashed border-border rounded-lg flex items-center justify-center text-sm text-text-tertiary mb-4 text-center">QR Code missing<br/><br/>Please set it in Admin Settings</div>'); }} />
                    <label className="w-full">
                      <span className="block text-sm font-medium text-text-secondary mb-2">Upload Payment Screenshot</span>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-surface-secondary hover:bg-surface transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 text-text-tertiary mb-2" />
                            <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-text-tertiary">{file ? file.name : 'PNG, JPG or JPEG (Max: 5MB)'}</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border sticky top-24">
          <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>NPR {Math.round(totals.subtotal / 100).toLocaleString()}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- NPR {Math.round(totals.discountAmount / 100).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span>NPR {Math.round(totals.shippingCost / 100).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border flex justify-between font-semibold text-lg text-text-primary mb-6">
            <span>Total</span>
            <span>NPR {Math.round(totals.total / 100).toLocaleString()}</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (method === "ESEWA" && !file)}
            className={cn(
              "w-full h-14 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300",
              "bg-accent hover:bg-accent/90 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]",
              (isSubmitting || (method === "ESEWA" && !file)) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : method === "ESEWA" ? "Submit Proof & Confirm Order" : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  )
}
