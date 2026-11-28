"use client"

import React, { useState, useRef } from "react"
import { ChevronLeft, Loader2, UploadCloud, CheckCircle2, X, Zap, ShieldCheck } from "lucide-react"
import { submitCheckoutAction } from "@/actions/checkout.actions"
import { uploadCustomerLocalFileAction } from "@/actions/customer.media.actions"
import { convertImageToWebP } from "@/lib/utils/image-compression"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function PaymentStep({ addressData, totals, paymentQrs, onBack }: any) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [compressionStats, setCompressionStats] = useState<{ originalSize: number; compressedSize: number; reduction: number } | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalTotalFormatted = Math.round(totals.total / 100).toLocaleString()

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

      // 2. Eager Background Upload
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
    if (!file) {
      setError("Please upload your eSewa payment receipt or screenshot to proceed.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    let paymentProofUrl: string | undefined = uploadedProofUrl || undefined

    // Check if background upload finished or await in-flight promise briefly
    if (!paymentProofUrl && inFlightUploadRef.current) {
      try {
        const timeoutPromise = new Promise<null>((res) => setTimeout(() => res(null), 400))
        const url = await Promise.race([inFlightUploadRef.current, timeoutPromise])
        if (url) {
          paymentProofUrl = url
        }
      } catch {
        // ignore
      }
    }

    // Fallback: Use the lightweight WebP data URL directly if background upload is still finishing
    if (!paymentProofUrl && filePreviewUrl) {
      paymentProofUrl = filePreviewUrl
    }

    const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)

    const result = await submitCheckoutAction({
      ...addressData,
      paymentMethod: "ESEWA",
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
      {/* Back button */}
      <button 
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#8C7A72] hover:text-[#1A110F] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Back to delivery details</span>
      </button>

      {/* Main Payment Card */}
      <div className="bg-white rounded-xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-[#F2EFEA] gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89563]">
                eSewa Payment Verification
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1A110F] font-normal">
              Scan QR &amp; Pay
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#8C7A72] block">Total Payable</span>
            <span className="font-bold text-lg sm:text-xl text-[#1A110F]">
              NPR {finalTotalFormatted}
            </span>
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF6F2] rounded-xl border border-[#EDE3DB]/70">
          <div className="bg-white p-3 rounded-lg border border-[#EDE3DB] shadow-xs mb-3">
            <img 
              src={paymentQrs?.esewaUrl || "/esewa-qr.png"} 
              alt="eSewa QR Code" 
              className="w-48 h-48 sm:w-56 sm:h-56 rounded object-cover" 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.parentElement!.insertAdjacentHTML(
                  'afterbegin', 
                  '<div class="w-48 h-48 sm:w-56 sm:h-56 bg-[#FAF6F2] flex items-center justify-center text-xs text-[#8C7A72] text-center p-4">eSewa QR code is being updated.<br/><br/>Please contact support or pay directly to official eSewa ID.</div>'
                ); 
              }} 
            />
          </div>

          <div className="text-center space-y-1 max-w-xs">
            <p className="text-xs font-semibold text-[#1A110F]">
              Scan with your eSewa App
            </p>
            <p className="text-[11px] text-[#8C7A72] leading-relaxed">
              1. Open eSewa app &amp; scan QR<br />
              2. Transfer exactly <strong>NPR {finalTotalFormatted}</strong><br />
              3. Take a screenshot &amp; upload below
            </p>
          </div>
        </div>

        {/* Screenshot Upload Dropzone */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
            Payment Screenshot <span className="text-[#B89563]">*</span>
          </label>

          {file && filePreviewUrl ? (
            <div className="flex flex-col items-center justify-center p-4 border border-emerald-500/40 rounded-xl bg-emerald-50/20 relative">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#EDE3DB] shadow-xs mb-2.5 bg-white">
                <img src={filePreviewUrl} alt="Uploaded Payment Screenshot" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isUploading ? "Uploading receipt..." : "Screenshot Ready"}</span>
              </div>

              {compressionStats && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100/80 text-emerald-900 rounded-full text-[10px] font-medium font-mono">
                  <Zap className="w-3 h-3 text-emerald-700" />
                  <span>Optimized {formatFileSize(compressionStats.compressedSize)} ({compressionStats.reduction}% smaller)</span>
                </div>
              )}

              <p className="text-[11px] text-[#8C7A72] max-w-[240px] truncate mt-1">{file.name}</p>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="mt-2.5 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove &amp; choose another</span>
              </button>
            </div>
          ) : (
            <label 
              htmlFor="dropzone-file" 
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#DDD0C6] rounded-xl cursor-pointer bg-[#FAF6F2] hover:bg-white hover:border-[#B89563] transition-all"
            >
              <div className="flex flex-col items-center justify-center py-4 px-4 text-center">
                {isCompressing ? (
                  <>
                    <Loader2 className="w-6 h-6 text-[#B89563] animate-spin mb-1.5" />
                    <p className="text-xs font-medium text-[#1A110F]">Processing screenshot...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-[#8C7A72] mb-1.5" />
                    <p className="text-xs font-medium text-[#1A110F]">
                      <span className="text-[#B89563] underline">Click to upload screenshot</span>
                    </p>
                    <p className="text-[11px] text-[#8C7A72] mt-0.5">PNG, JPG, or JPEG from your photo gallery</p>
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

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !file || isCompressing}
          className={cn(
            "w-full h-[54px] rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300",
            "bg-[#1A110F] text-white hover:bg-[#B89563] active:scale-[0.99] shadow-sm",
            "flex items-center justify-center gap-2",
            (isSubmitting || !file || isCompressing) && "opacity-50 cursor-not-allowed transform-none"
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying &amp; Placing Order…</span>
            </div>
          ) : file ? (
            "Submit Proof & Confirm Order"
          ) : (
            "Upload Screenshot to Confirm Order"
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A72] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Payment is safely verified by XINVORA team</span>
        </div>
      </div>
    </div>
  )
}
