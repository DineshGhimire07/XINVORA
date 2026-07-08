"use client"

import * as React from "react"
import { Banknote, Wallet, Building, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type PaymentMethodId = "COD" | "ESEWA" | "KHALTI" | "BANK"

interface PaymentMethod {
  id: PaymentMethodId
  label: string
  description: string
  icon: React.ReactNode
  available: boolean
  badge?: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "COD",
    label: "Cash on Delivery",
    description: "Pay when your order arrives at your door.",
    icon: <Banknote className="w-5 h-5" />,
    available: true,
  },
  {
    id: "ESEWA",
    label: "eSewa",
    description: "Scan QR code to pay via eSewa digital wallet.",
    icon: <Wallet className="w-5 h-5 text-green-500" />,
    available: true,
  },
  {
    id: "KHALTI",
    label: "Khalti",
    description: "Scan QR code to pay via Khalti digital wallet.",
    icon: <Wallet className="w-5 h-5 text-purple-600" />,
    available: true,
  },
  {
    id: "BANK",
    label: "Bank Transfer",
    description: "Direct bank transfer. Scan QR or use details below.",
    icon: <Building className="w-5 h-5 text-blue-500" />,
    available: true,
  },
]

interface PaymentMethodSelectorProps {
  value: PaymentMethodId
  onChange: (id: PaymentMethodId) => void
  error?: string
  paymentQrs?: any
  paymentProofFile?: File | null
  onFileChange?: (file: File | null) => void
}

export function PaymentMethodSelector({ value, onChange, error, paymentQrs, paymentProofFile, onFileChange }: PaymentMethodSelectorProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onFileChange) onFileChange(e.target.files[0])
    } else {
      if (onFileChange) onFileChange(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.id
          
          return (
          <label
            key={method.id}
            htmlFor={`payment-${method.id}`}
            className={cn(
              "relative flex flex-col p-4 rounded-xl border-2 transition-all duration-200",
              method.available ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              isSelected
                ? "border-accent bg-accent/5 shadow-sm"
                : "border-border hover:border-border-strong bg-white dark:bg-[#1a1a1a]"
            )}
          >
            <div className="flex items-start gap-4">
              <input
                id={`payment-${method.id}`}
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                disabled={!method.available}
                onChange={() => method.available && onChange(method.id)}
                className="sr-only"
              />

              {/* Icon */}
              <div
                className={cn(
                  "mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-surface-secondary text-text-secondary"
                )}
              >
                {method.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{method.label}</p>
                  {method.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-secondary text-text-tertiary border border-border uppercase tracking-wider">
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">{method.description}</p>
              </div>

              {/* Selected indicator */}
              {isSelected ? (
                <div className="mt-0.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              ) : method.available ? (
                <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-border shrink-0" />
              ) : null}
            </div>

            {/* QR Code Expansion */}
            {isSelected && method.id !== "COD" && paymentQrs && (
              <div className="mt-4 pt-4 border-t border-border flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
                {method.id === "ESEWA" && paymentQrs.esewaUrl && (
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border bg-white p-2">
                      <Image src={paymentQrs.esewaUrl} alt="eSewa QR" fill className="object-contain" />
                    </div>
                    <p className="text-xs text-text-tertiary mt-2 text-center">Scan to pay via eSewa</p>
                  </div>
                )}
                {method.id === "KHALTI" && paymentQrs.khaltiUrl && (
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border bg-white p-2">
                      <Image src={paymentQrs.khaltiUrl} alt="Khalti QR" fill className="object-contain" />
                    </div>
                    <p className="text-xs text-text-tertiary mt-2 text-center">Scan to pay via Khalti</p>
                  </div>
                )}
                {method.id === "BANK" && (
                  <div className="flex flex-col items-center w-full">
                    {paymentQrs.bankUrl && (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border bg-white p-2 mb-3">
                        <Image src={paymentQrs.bankUrl} alt="Bank QR" fill className="object-contain" />
                      </div>
                    )}
                    {paymentQrs.bankDetails && (
                      <div className="w-full bg-surface-secondary/50 p-3 rounded-lg border border-border/50 text-xs text-text-secondary whitespace-pre-wrap font-mono">
                        {paymentQrs.bankDetails}
                      </div>
                    )}
                    <p className="text-xs text-text-tertiary mt-2 text-center">Complete the transfer and place order</p>
                  </div>
                )}

                {/* Upload Payment Proof */}
                {onFileChange && (
                  <div className="mt-4 pt-4 border-t border-border/50 w-full flex flex-col items-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">Upload Payment Screenshot (Optional)</p>
                    <label className="w-full flex items-center justify-center p-3 border border-dashed border-border rounded-lg bg-surface hover:bg-surface-secondary cursor-pointer transition-colors">
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      <span className="text-xs text-text-tertiary">
                        {paymentProofFile ? paymentProofFile.name : "Click to select a file"}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </label>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
