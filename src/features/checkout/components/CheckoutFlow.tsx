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
    shippingMethod: any
    shippingCost: number
    taxRate: number
    taxAmount: number
    total: number
    couponRecord: any
  }
  initialDistricts?: any[]
  initialMunicipalities?: any[]
}

export function CheckoutFlow({
  provinces,
  savedAddress,
  totals,
  initialDistricts = [],
  initialMunicipalities = [],
}: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [addressData, setAddressData] = useState<NepalDeliveryFormValues | null>(null)
  const [paymentQrs, setPaymentQrs] = useState<any>(null)
  const [loadingQrs, setLoadingQrs] = useState(false)

  // Start pre-fetching paymentQrs as early as possible (on mount) so it's ready by Step 2
  useEffect(() => {
    let active = true
    async function fetchQrs() {
      try {
        const res = await getPaymentQrsAction()
        if (res.success && active) {
          setPaymentQrs(res.data)
        }
      } catch (err) {
        console.error("Error fetching payment QRs in background:", err)
      }
    }
    fetchQrs()
    return () => {
      active = false
    }
  }, [])

  const handleAddressSuccess = async (data: NepalDeliveryFormValues) => {
    setAddressData(data)
    
    // Safety check: if background fetch failed/slow, fetch again and wait before changing step
    if (!paymentQrs) {
      setLoadingQrs(true)
      try {
        const res = await getPaymentQrsAction()
        if (res.success) {
          setPaymentQrs(res.data)
        }
      } catch (err) {
        console.error("Manual fallback QR fetch failed:", err)
      } finally {
        setLoadingQrs(false)
      }
    }
    
    setStep(2)
  }

  const goBack = () => setStep(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  return (
    <div className="w-full relative min-h-[600px]">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <div className="bg-surface rounded-2xl p-6 lg:p-8 shadow-sm border border-border">
                  <NepalDeliveryForm
                    provinces={provinces}
                    savedAddress={savedAddress}
                    initialDistricts={initialDistricts}
                    initialMunicipalities={initialMunicipalities}
                    onSuccess={handleAddressSuccess}
                    initialData={addressData}
                  />
                </div>
              </div>
              <div className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-24">
                  <OrderSummary cart={totals.cart} />
                </div>
              </div>
            </div>
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
  )
}

