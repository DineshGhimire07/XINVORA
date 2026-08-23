"use client"

import React, { useState, useRef } from "react"
import { ChevronLeft, Loader2, CreditCard, Banknote, UploadCloud, CheckCircle2, X, Zap } from "lucide-react"
import { submitCheckoutAction } from "@/actions/checkout.actions"
import { uploadCustomerLocalFileAction } from "@/actions/customer.media.actions"
import { convertImageToWebP } from "@/lib/utils/image-compression"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function PaymentStep({ addressData, totals, paymentQrs, onBack }: any) {
  const router = useRouter()
  const [method, setMethod] = useState<"COD" | "ESEWA">("COD")
  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [compressionStats, setCompressionStats] = useState<{ originalSize: number; compressedSize: number; reduction: number } | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In-flight background upload promise ref
  const inFlightUploadRef = useRef<Promise<string | null> | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)
    setIsCompressing(true)

    try {
      // 1. Instant Client-Side WebP Compression (< 35ms)
      const compressed = await convertImageToWebP(selectedFile, {
        maxDimension: 1600,
        quality: 0.82,
      })

      setFile(compressed.file)
      setFilePreviewUrl(compressed.dataUrl)
      setCompressionStats({
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        reduction: compressed.sizeReductionPercent,
      })
      setIsCompressing(false)

      // 2. Eager Background Upload — start sending the ~50KB WebP immediately!
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", compressed.file)

      const uploadPromise = (async () => {
        try {
          const res = await uploadCustomerLocalFileAction(formData)
          if (res.success && res.url) {
            setUploadedProofUrl(res.url)
            return res.url
          } else {
            console.warn("[PaymentStep] Background upload failed:", res.error)
            return null
          }
        } catch (err) {
          console.warn("[PaymentStep] Background upload error:", err)
          return null
        } finally {
          setIsUploading(false)
        }
      })()

      inFlightUploadRef.current = uploadPromise
    } catch (err: any) {
      console.error("[PaymentStep] Compression error:", err)
      // Fallback to original file
      setFile(selectedFile)
      setFilePreviewUrl(URL.createObjectURL(selectedFile))
      setIsCompressing(false)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFile(null)
    setFilePreviewUrl(null)
    setCompressionStats(null)
    setUploadedProofUrl(null)
    inFlightUploadRef.current = null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    let paymentProofUrl: string | undefined = uploadedProofUrl || undefined

    if (method === "ESEWA") {
      if (!file) {
        setError("Please upload your payment screenshot.")
        setIsSubmitting(false)
        return
      }

      // Fast Path: Check if background upload finished or await in-flight promise briefly
      if (!paymentProofUrl && inFlightUploadRef.current) {
        try {
          const timeoutPromise = new Promise<null>((res) => setTimeout(() => res(null), 300))
          const url = await Promise.race([inFlightUploadRef.current, timeoutPromise])
          if (url) {
            paymentProofUrl = url
          }
        } catch {
          // ignore
        }
      }

      // Instant Fallback: Use the lightweight WebP data URL directly (zero wait time!)
      if (!paymentProofUrl && filePreviewUrl) {
        paymentProofUrl = filePreviewUrl
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
      shippingMethodId: totals.shippingMethodId,
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
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Address
      </button>
      
      <div className="space-y-5 pt-4">
        <div className="mb-6 space-y-1 pb-4 border-b border-border/50">
          <h2 className="text-xl font-display font-medium tracking-wide text-text-primary">Payment Method</h2>
          <p className="text-sm text-text-tertiary">Choose how you want to pay</p>
        </div>
        
        <div className="space-y-4">
          {/* COD Option */}
          <label className={cn(
            "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
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
                <Banknote className="w-5 h-5 text-success" />
                Cash on Delivery
              </div>
              <p className="text-sm text-text-secondary mt-1">Pay with cash when your order arrives.</p>
            </div>
          </label>

          {/* eSewa Option */}
          <label className={cn(
            "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
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
                <CreditCard className="w-5 h-5 text-success" />
                eSewa (Instant QR Verification)
              </div>
              <p className="text-sm text-text-secondary mt-1">Scan the QR code and upload a screenshot of your payment.</p>
              
              {method === "ESEWA" && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                  <img src={paymentQrs?.esewaUrl || "/esewa-qr.png"} alt="eSewa QR Code" className="w-48 h-48 rounded-lg border shadow-sm mb-4 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.insertAdjacentHTML('afterbegin', '<div class="w-48 h-48 bg-surface-secondary border border-dashed border-border rounded-lg flex items-center justify-center text-sm text-text-tertiary mb-4 text-center">QR Code missing<br/><br/>Please set it in Admin Settings</div>'); }} />
                  <div className="w-full">
                    <span className="block text-sm font-medium text-text-secondary mb-2">Upload Payment Screenshot</span>
                    <div className="flex items-center justify-center w-full">
                      {file && filePreviewUrl ? (
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-emerald-600/30 rounded-lg bg-emerald-50/20 w-full relative">
                          <div className="relative w-36 h-36 rounded-md overflow-hidden border border-[#E8DED2] shadow-sm mb-3 bg-white">
                            <img src={filePreviewUrl} alt="Uploaded Payment Screenshot" className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                            <span>{isUploading ? "Uploading receipt..." : "Payment Receipt Ready"}</span>
                          </div>

                          {/* Fast WebP Optimization Stat Pill */}
                          {compressionStats && (
                            <div className="flex items-center gap-1 px-2 py-0.5 mt-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-medium font-mono">
                              <Zap className="w-3 h-3 text-emerald-700" />
                              <span>WebP: {formatFileSize(compressionStats.compressedSize)} ({compressionStats.reduction}% optimized)</span>
                            </div>
                          )}

                          <p className="text-xs text-[#777777] max-w-[240px] truncate mt-1">{file.name}</p>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="mt-3 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove & re-upload</span>
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E8DED2] rounded-lg cursor-pointer bg-[#FAF9F6] hover:bg-white hover:border-[#B89563] transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isCompressing ? (
                              <>
                                <Loader2 className="w-8 h-8 text-[#B89563] animate-spin mb-2" />
                                <p className="text-xs font-medium text-[#1E1E1E]">Optimizing image to WebP...</p>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-8 h-8 text-[#9A9087] mb-2" />
                                <p className="mb-1 text-xs font-medium text-[#1E1E1E]">
                                  <span className="font-semibold text-[#B89563]">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-[11px] text-[#777777]">PNG, JPG or JPEG (Auto-compressed to WebP)</p>
                              </>
                            )}
                          </div>
                          <input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            disabled={isCompressing}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-error-muted text-error text-sm border border-error/20 flex items-start gap-3">
              <div className="font-medium">{error}</div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (method === "ESEWA" && !file) || isCompressing}
            className={cn(
              "w-full h-[54px] rounded font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300",
              "bg-[#1E1E1E] text-white hover:bg-[#B89563] hover:-translate-y-0.5 shadow-sm",
              "flex items-center justify-center gap-2",
              (isSubmitting || (method === "ESEWA" && !file) || isCompressing) && "opacity-60 cursor-not-allowed transform-none"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Confirming Order...</span>
              </div>
            ) : method === "ESEWA" ? "Submit Proof & Confirm Order" : "Confirm Order"}
          </button>

          {/* Editorial Brand Story Card */}
          <div className="mt-8 p-6 bg-white border border-[#E8DED2] rounded-lg space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#B89563] uppercase">The XINVORA Promise</span>
            <p className="text-xs text-[#777777] leading-relaxed font-light">
              "Every XINVORA piece is carefully curated and quality checked before dispatch. Our goal isn't to sell more clothes. It's to help you discover pieces you'll genuinely love."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
