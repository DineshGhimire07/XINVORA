"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NepalDeliveryForm } from "./NepalDeliveryForm"
import { PaymentStep } from "./PaymentStep"
import { type NepalDeliveryFormValues } from "@/validations/checkout"

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
  paymentQrs?: any
}

export function CheckoutFlow({ provinces, savedAddress, totals, paymentQrs }: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [addressData, setAddressData] = useState<NepalDeliveryFormValues | null>(null)

  const handleAddressSuccess = (data: NepalDeliveryFormValues) => {
    setAddressData(data)
    setStep(2)
  }

  const goBack = () => setStep(1)

  React.useEffect(() => {
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
                    onSuccess={handleAddressSuccess}
                    initialData={addressData}
                  />
                </div>
              </div>
              <div className="lg:col-span-4 hidden lg:block">
                {/* Visual placeholder or mini summary for step 1 can go here */}
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border sticky top-24">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
                    Order Summary
                  </h3>
                  <div className="flex justify-between text-body-md text-text-primary mb-2">
                    <span>Subtotal</span>
                    <span>NPR {Math.round(totals.subtotal / 100).toLocaleString()}</span>
                  </div>
                  <div className="text-body-sm text-text-secondary mb-4">
                    Shipping will be calculated in the next step.
                  </div>
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
            <PaymentStep
              addressData={addressData}
              totals={totals}
              paymentQrs={paymentQrs}
              onBack={goBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
