"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { NepalDeliveryForm } from "./NepalDeliveryForm"
import { PaymentStep } from "./PaymentStep"
import { OrderSummary } from "./OrderSummary"
import { type NepalDeliveryFormValues } from "@/validations/checkout"
import { getPaymentQrsAction } from "@/actions/checkout.actions"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface CheckoutFlowProps {
  provinces: any[]
  savedAddress?: any
  totals: {
    cart: any
    subtotal: number
    discountAmount: number
    shippingMethodId: string
    shippingCost: number
    total: number
  }
  allDistricts?: any[]
  initialDistricts?: any[]
  initialMunicipalities?: any[]
  initialPaymentQrs?: any
}

export function CheckoutFlow({
  provinces,
  savedAddress,
  totals,
  allDistricts = [],
  initialDistricts = [],
  initialMunicipalities = [],
  initialPaymentQrs,
}: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [addressData, setAddressData] = useState<NepalDeliveryFormValues | null>(null)
  const [paymentQrs, setPaymentQrs] = useState<any>(initialPaymentQrs || null)
  const [loadingQrs, setLoadingQrs] = useState(false)
  const { trackEvent } = useAnalytics()

  const itemCount = totals.cart.items.reduce((acc: number, i: any) => acc + i.quantity, 0)
  const finalTotal = Math.round(totals.total / 100)

  // Analytics: CHECKOUT_START
  useEffect(() => {
    trackEvent(AnalyticsEvent.CHECKOUT_START)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Eager pre-fetch & image preloading on mount (Step 1) for instant 0ms Step 2 transition
  useEffect(() => {
    let active = true
    if (!paymentQrs) {
      setLoadingQrs(true)
      getPaymentQrsAction().then((res) => {
        if (res.success && active && res.data) {
          setPaymentQrs(res.data)
          if (typeof window !== "undefined" && res.data.esewaUrl) {
            const img = new window.Image()
            img.src = res.data.esewaUrl
          }
        }
        if (active) setLoadingQrs(false)
      })
    } else if (typeof window !== "undefined" && paymentQrs?.esewaUrl) {
      const img = new window.Image()
      img.src = paymentQrs.esewaUrl
    }
    return () => {
      active = false
    }
  }, [paymentQrs])

  const handleAddressSuccess = async (data: NepalDeliveryFormValues) => {
    setAddressData(data)
    setStep(2)
  }

  const goBack = () => setStep(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  return (
    <div className="min-h-screen bg-[#FAF6F2]">
      <div className="flex flex-col lg:flex-row w-full">
        {/* ── Left: Main Checkout Flow ── */}
        <div className="flex-1 pt-8 pb-32 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-12 xl:px-24">
          <div className="max-w-xl mx-auto lg:ml-auto lg:mr-16 w-full">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase mb-1.5">
                XINVORA
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide text-[#1A110F]">
                {step === 1 ? "Delivery" : "Payment"}
              </h1>
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mt-3">
                <div
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    step >= 1 ? "w-8 bg-[#B89563]" : "w-4 bg-[#DDD0C6]"
                  }`}
                />
                <div
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    step >= 2 ? "w-8 bg-[#B89563]" : "w-4 bg-[#DDD0C6]"
                  }`}
                />
              </div>
            </div>

            {/* ── What You're Buying (Items in Order Preview) ── */}
            <div className="bg-white rounded-xl border border-[#EDE3DB] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2EFEA]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89563]">
                  In Your Bag ({itemCount} {itemCount === 1 ? "piece" : "pieces"})
                </span>
              </div>

              <div className="divide-y divide-[#F2EFEA]">
                {totals.cart.items.map((item: any) => (
                  <div key={item.id} className="py-3 first:pt-3 last:pb-0 flex items-center gap-3">
                    <div className="relative w-14 h-16 rounded-md overflow-hidden bg-[#FAF6F2] border border-[#EDE3DB] shrink-0">
                      {item.variant.images?.[0] && (
                        <Image
                          src={item.variant.images[0].url}
                          alt={item.variant.product.name}
                          fill
                          sizes="56px"
                          className="object-cover object-top"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#1A110F] truncate">
                        {item.variant.product.name}
                      </p>
                      <p className="text-[11px] text-[#8C7A72] mt-0.5">
                        {[item.variant.color?.name, item.variant.size?.name].filter(Boolean).join(" / ") || "Standard"}
                        {" · "}Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#1A110F] shrink-0">
                      NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Bill Breakdown */}
              <div className="pt-4 border-t border-[#F2EFEA] space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89563] pb-0.5">
                  Bill Summary
                </div>
                <div className="flex justify-between text-[#73645D]">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-[#1A110F]">NPR {Math.round(totals.subtotal / 100).toLocaleString()}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-medium">− NPR {Math.round(totals.discountAmount / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#73645D]">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-[#1A110F]">NPR {Math.round(totals.shippingCost / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#EDE3DB] text-sm">
                  <span className="font-semibold text-[#1A110F]">Total Payable</span>
                  <span className="font-bold text-[#1A110F]">NPR {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <NepalDeliveryForm
                    provinces={provinces}
                    savedAddress={savedAddress}
                    allDistricts={allDistricts}
                    initialDistricts={initialDistricts}
                    initialMunicipalities={initialMunicipalities}
                    onSuccess={handleAddressSuccess}
                    initialData={addressData}
                  />
                </motion.div>
              )}

              {step === 2 && addressData && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {loadingQrs ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                      <span className="w-6 h-6 border-2 border-[#B89563] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[#8C7A72]">Loading payment details...</span>
                    </div>
                  ) : (
                    <PaymentStep
                      addressData={addressData}
                      totals={totals}
                      paymentQrs={paymentQrs}
                      onBack={goBack}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Order summary (desktop only sticky breakdown) ── */}
        <div className="hidden lg:block w-[42%] xl:w-[38%] bg-[#F3EDE6]/60 pt-32 pb-24 px-10 xl:px-16 border-l border-[#E8DED2]">
          <div className="max-w-sm w-full lg:sticky lg:top-32">
            <OrderSummary
              cart={totals.cart}
              shippingCost={totals.shippingCost}
              discountAmount={totals.discountAmount}
              total={totals.total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
