"use client"

import Link from "next/link"
import { useActionState } from "react"
import { clearCartAction } from "@/actions/cart.actions"
import { Button } from "@/components/ui/button"
import { Stack } from "@/components/shared/stack"

interface CartSummaryProps {
  subtotal: number
  total: number
  isEstimate?: boolean
}

export function CartSummary({ subtotal, total, isEstimate }: CartSummaryProps) {
  const [clearState, clearAction, isClearing] = useActionState<any, FormData>(clearCartAction, null)

  return (
    <div className="p-6 bg-surface border border-border">
      <Stack gap={6}>
        <h2 className="text-body-lg font-medium text-text-primary uppercase tracking-wider">
          Order Summary
        </h2>
        
        <Stack gap={3}>
          <div className="flex justify-between text-body-md text-text-primary">
            <span>Subtotal</span>
            <span>NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
          <div className="text-body-sm text-text-secondary">
            Shipping will be calculated at checkout
          </div>
        </Stack>
        
        <div className="pt-4 border-t border-border flex justify-between text-body-lg font-medium text-text-primary">
          <span>Total</span>
          <span>NPR {Math.round(total / 100).toLocaleString()}</span>
        </div>
        {isEstimate && (
          <p className="text-xs text-text-tertiary text-center -mt-2">
            Estimated total — final total calculated at checkout
          </p>
        )}
        
        <Link href="/checkout" className="w-full">
          <Button className="w-full">
            Proceed to Checkout
          </Button>
        </Link>

        <form action={clearAction}>
          <Button type="submit" variant="outline" disabled={isClearing} className="w-full mt-4">
            Clear Cart
          </Button>
        </form>
      </Stack>
    </div>
  )
}
