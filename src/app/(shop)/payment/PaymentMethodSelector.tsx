"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { initializePaymentAction } from "@/actions/payment.actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Stack } from "@/components/shared/stack"

interface PaymentMethodSelectorProps {
  orderId: string
  orderNumber: string
  csrfNonce: string
}

export function PaymentMethodSelector({ orderId, orderNumber, csrfNonce }: PaymentMethodSelectorProps) {
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<string>("DUMMY")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const providers = [
    { id: "DUMMY", name: "Dummy Sandbox Simulator", description: "Test the payment integration loop safely in development.", active: true },
    { id: "KHALTI", name: "Khalti Wallet", description: "Pay securely via simulated Khalti payment gateway portal.", active: true },
    { id: "ESEWA", name: "eSewa Mobile Wallet", description: "Instant mobile payment via simulated eSewa portal.", active: true },
    { id: "STRIPE", name: "Credit / Debit Card (Stripe)", description: "Secure card payments backed by simulated Stripe portal.", active: true },
  ]

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    // Construct callback url where the mock/real gateway will redirect back
    const callbackUrl = `${window.location.origin}/payment/verify`

    const result = await initializePaymentAction(orderId, selectedProvider, callbackUrl, csrfNonce)
    if (!result.success) {
      setError(result.error?.message || "Failed to initialize payment gateway.")
      setLoading(false)
      return
    }

    if (result.data?.redirectUrl) {
      router.push(result.data.redirectUrl)
    } else {
      setError("No redirect URL returned by gateway.")
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-none border-border-primary/40 shadow-sm">
      <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
        <CardTitle className="text-lg font-light tracking-wide uppercase">Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Stack gap={6}>
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {providers.map((p) => (
              <label
                key={p.id}
                className={`block p-4 border rounded-none cursor-pointer transition-all duration-200 ${
                  !p.active
                    ? "opacity-50 border-border bg-surface-secondary/10 cursor-not-allowed"
                    : selectedProvider === p.id
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-text-secondary hover:bg-surface-secondary/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="provider"
                    value={p.id}
                    checked={selectedProvider === p.id}
                    disabled={!p.active}
                    onChange={() => setSelectedProvider(p.id)}
                    className="mt-1 text-accent focus:ring-accent"
                  />
                  <div>
                    <h3 className="text-body-md font-medium text-text-primary flex items-center gap-2">
                      {p.name}
                      {!p.active && (
                        <span className="text-[9px] font-bold tracking-widest uppercase bg-surface-secondary text-text-secondary border border-border px-1.5 py-0.5 rounded-xs">
                          Coming Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-body-sm text-text-secondary mt-1">
                      {p.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full py-4 uppercase tracking-widest text-xs font-semibold rounded-none"
            disabled={loading}
            onClick={handlePay}
          >
            {loading ? "Redirecting to Gateway..." : "Proceed to Payment"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
