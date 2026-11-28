"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Truck, ArrowRight } from "lucide-react"
import { clearCartAction } from "@/actions/cart.actions"
import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  subtotal: number
  total: number
  shipping?: number
  isEstimate?: boolean
}

export function CartSummary({ subtotal, total, shipping = 17000 }: CartSummaryProps) {
  const [clearState, clearAction, isClearing] = useActionState<any, FormData>(clearCartAction, null)
  const finalTotal = subtotal > 0 ? subtotal + shipping : 0

  return (
    <div className="p-6 bg-surface border border-border rounded-lg">
      <div className="flex flex-col gap-6">
        <h2 className="text-body-md font-bold text-text-primary uppercase tracking-wider">
          Order Summary
        </h2>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-body-sm text-text-primary">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-body-sm text-text-primary">
            <span className="font-medium">Delivery</span>
            <span className="font-semibold text-text-primary">NPR {Math.round(shipping / 100).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-heading-xs font-semibold text-text-primary uppercase tracking-wider">Total</span>
            <span className="text-heading-xs font-semibold text-text-primary">NPR {Math.round(finalTotal / 100).toLocaleString()}</span>
          </div>
          <p className="text-caption text-text-secondary text-center mt-3">
            Inclusive of NPR 170 nationwide delivery
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="w-full block">
            <Button className="w-full bg-ink border-ink text-white hover:bg-ink-soft hover:border-ink-soft h-12 uppercase tracking-widest text-[11px]" rightIcon={<ArrowRight className="w-4 h-4 ml-1 inline" />}>
              Proceed to Checkout
            </Button>
          </Link>

          <form action={clearAction} className="w-full">
            <Button type="submit" variant="outline" disabled={isClearing} className="w-full h-12 uppercase tracking-widest text-[11px] text-black border-black/20 hover:border-black/50 hover:bg-neutral-50">
              Clear Cart
            </Button>
          </form>
        </div>

        {/* Estimated Delivery */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-body-sm font-medium text-text-primary mb-3">
            <Truck className="w-4 h-4" />
            <span>Estimated delivery</span>
          </div>
          <div className="space-y-2 text-body-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Kathmandu Valley</span>
              <span className="text-text-tertiary font-medium">2-4 Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Outside Valley</span>
              <span className="text-text-tertiary font-medium">3-7 Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
