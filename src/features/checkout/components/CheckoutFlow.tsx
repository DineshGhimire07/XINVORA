"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ShoppingBag } from "lucide-react"
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

// ── Mobile Order Summary Accordion ───────────────────────────────────────────
function MobileOrderSummary({ totals }: { totals: CheckoutFlowProps["totals"] }) {
  const [open, setOpen] = useState(false)
  const { cart, subtotal, discountAmount, shippingCost, total } = totals
  const itemCount = cart.items.reduce((acc: number, i: any) => acc + i.quantity, 0)
  const finalTotal = Math.round(total / 100)

  return (
    <div className="lg:hidden border-b border-[#E8DED2] bg-[#FAF6F2]">
      {/* Summary toggle bar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[#1E1E1E]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[#B89563] font-semibold text-xs tracking-wide uppercase">
          <ShoppingBag className="w-3.5 h-3.5" />
          {open ? "Hide order summary" : `Show order summary (${itemCount} item${itemCount !== 1 ? "s" : ""})`}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
        <span className="font-semibold text-[#1E1E1E]">NPR {finalTotal.toLocaleString()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Item list */}
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-md overflow-hidden bg-[#EDE3DB] shrink-0">
                    {item.variant.images?.[0] && (
                      <Image
                        src={item.variant.images[0].url}
                        alt={item.variant.images[0].altText || item.variant.product.name}
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    )}
                    {item.quantity > 1 && (
                      <span className="absolute top-0.5 right-0.5 bg-[#1E1E1E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1E1E1E] truncate">{item.variant.product.name}</p>
                    {(item.variant.color?.name || item.variant.size?.name) && (
                      <p className="text-[11px] text-[#9A9087] mt-0.5">
                        {[item.variant.color?.name, item.variant.size?.name].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#1E1E1E] shrink-0">
                    NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t border-[#EDE3DB] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#9A9087]">
                  <span>Subtotal</span>
                  <span>NPR {Math.round(subtotal / 100).toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>− NPR {Math.round(discountAmount / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#9A9087]">
                  <span>Shipping</span>
                  <span>NPR {Math.round(shippingCost / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm text-[#1E1E1E] pt-1 border-t border-[#EDE3DB]">
                  <span>Total</span>
                  <span>NPR {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main CheckoutFlow ─────────────────────────────────────────────────────────
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

  // Analytics: CHECKOUT_START — fire once when checkout flow mounts
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
      {/* ── Mobile collapsible order summary ── */}
      <MobileOrderSummary totals={totals} />

      <div className="flex flex-col lg:flex-row w-full">
        {/* ── Left: Form area ── */}
        <div className="flex-1 pt-8 pb-32 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-12 xl:px-24">
          <div className="max-w-xl mx-auto lg:ml-auto lg:mr-16 w-full">
            {/* Header */}
            <div className="mb-8 lg:mb-12">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#B89563] uppercase mb-1.5">
                XINVORA
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-wide text-[#1A110F]">
                {step === 1 ? "Delivery" : "Payment"}
              </h1>
              {/* Step dots */}
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

        {/* ── Right: Order summary (desktop only) ── */}
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
