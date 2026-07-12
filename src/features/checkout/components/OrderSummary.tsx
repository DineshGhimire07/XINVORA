"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CartResult } from "@/db/queries/types"

interface OrderSummaryProps {
  cart: CartResult
  shippingCost?: number
  discountAmount?: number
  total?: number
  children?: React.ReactNode
}

export function OrderSummary({ cart, shippingCost, discountAmount, total, children }: OrderSummaryProps) {
  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const finalTotal = total !== undefined ? total : (subtotal - (discountAmount || 0) + (shippingCost || 0))
  
  return (
    <Card className="rounded-none border-border-primary/40 shadow-sm bg-white">
      <CardHeader className="border-b border-border-primary/20 space-y-1">
        <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">Your Cart</p>
        <CardTitle className="text-2xl font-display font-light tracking-wide">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-24 bg-surface-secondary">
                {item.variant.images?.[0] ? (
                  <Image 
                    src={item.variant.images[0].url} 
                    alt={item.variant.images[0].altText || item.variant.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-medium text-sm">{item.variant.product.name}</h4>
                <p className="text-sm text-text-secondary mt-1">
                  {item.variant.color?.name && `${item.variant.color.name}`}
                  {item.variant.color?.name && item.variant.size?.name && " / "}
                  {item.variant.size?.name && `${item.variant.size.name}`}
                </p>
                <p className="text-sm text-text-secondary mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium pt-1">
                NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-border-primary/20 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span>NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
          {discountAmount !== undefined && discountAmount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span>- NPR {Math.round(discountAmount / 100).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Shipping</span>
            {shippingCost !== undefined ? (
              <span>NPR {Math.round(shippingCost / 100).toLocaleString()}</span>
            ) : (
              <span className="text-text-secondary text-xs italic">Calculated at next step</span>
            )}
          </div>
          <div className="flex justify-between font-medium text-lg border-t border-border-primary/20 pt-4 mt-2">
            <span>Total</span>
            <span>NPR {Math.round(finalTotal / 100).toLocaleString()}</span>
          </div>
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
