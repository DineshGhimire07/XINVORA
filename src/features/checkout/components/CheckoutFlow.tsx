"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NepalDeliveryForm } from "./NepalDeliveryForm"
import { PaymentStep } from "./PaymentStep"
import { OrderSummary } from "./OrderSummary"
import { type NepalDeliveryFormValues } from "@/validations/checkout"
import { getPaymentQrsAction } from "@/actions/checkout.actions"

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
  initialDistricts?: any[]
  initialMunicipalities?: any[]
  initialPaymentQrs?: any
}

export function CheckoutFlow({
  provinces,
  savedAddress,
  totals,
  initialDistricts = [],
  initialMunicipalities = [],
  initialPaymentQrs,
}: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [addressData, setAddressData] = useState<NepalDeliveryFormValues | null>(null)
  const [paymentQrs, setPaymentQrs] = useState<any>(initialPaymentQrs || null)
  const [loadingQrs, setLoadingQrs] = useState(false)

  // Eager pre-fetch & image preloading on mount (Step 1) for instant 0ms Step 2 transition
  useEffect(() => {
    let active = true
    if (!paymentQrs) {
      setLoadingQrs(true)
      getPaymentQrsAction().then((res) => {
        if (res.success && active && res.data) {
          setPaymentQrs(res.data)
          if (typeof window !== "undefined" && res.data.esewaUrl) {
            const img = new Image()
            img.src = res.data.esewaUrl
          }
        }
        if (active) setLoadingQrs(false)
      })
    } else if (typeof window !== "undefined" && paymentQrs?.esewaUrl) {
      const img = new Image()
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
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <div className="flex-1 bg-surface pt-32 pb-16 lg:pb-24 px-6 lg:px-12 xl:px-24">
        <div className="max-w-2xl mx-auto lg:ml-auto lg:mr-16 w-full">
          {/* Header */}
          <div className="mb-10 lg:mb-12">
            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-2">
              XINVORA
            </p>
            <h1 className="text-3xl lg:text-4xl font-display font-light tracking-wide text-text-primary">Checkout</h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NepalDeliveryForm
                  provinces={provinces}
                  savedAddress={savedAddress}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {loadingQrs ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                    <span className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-text-secondary">Loading payment details...</span>
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

      <div className="w-full lg:w-[45%] xl:w-[40%] bg-surface-secondary/40 pt-8 pb-24 lg:pt-32 px-6 lg:px-12 xl:px-24 border-t lg:border-t-0 lg:border-l border-border/50">
        <div className="max-w-md mx-auto lg:mr-auto lg:ml-12 w-full lg:sticky lg:top-32">
          <OrderSummary 
            cart={totals.cart} 
            shippingCost={totals.shippingCost} 
            discountAmount={totals.discountAmount}
            total={totals.total} 
          />
        </div>
      </div>
    </div>
  )
}

