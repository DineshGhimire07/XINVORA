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
    <Card className="rounded-lg border-[#E8DED2] shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-[#F2EFEA] space-y-1">
        <p className="text-[10px] font-bold tracking-[0.25em] text-[#B89563] uppercase">Your Cart</p>
        <CardTitle className="text-2xl font-display font-light tracking-wide text-[#1E1E1E]">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6 pr-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-24 bg-[#F2EFEA] rounded-md overflow-hidden isolate shrink-0">
                {item.variant.images?.[0] ? (
                  <Image 
                    src={item.variant.images[0].url} 
                    alt={item.variant.images[0].altText || item.variant.product.name}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                ) : null}
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <h4 className="font-medium text-sm text-[#1E1E1E] truncate">{item.variant.product.name}</h4>
                <p className="text-xs text-[#777777] mt-1">
                  {item.variant.color?.name && `${item.variant.color.name}`}
                  {item.variant.color?.name && item.variant.size?.name && " / "}
                  {item.variant.size?.name && `${item.variant.size.name}`}
                </p>
                <p className="text-xs text-[#777777] mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium text-[#1E1E1E] pt-1 shrink-0">
                NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-[#F2EFEA] pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-[#777777]">Subtotal</span>
            <span className="text-[#1E1E1E]">NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
          {discountAmount !== undefined && discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700">
              <span>Discount</span>
              <span>- NPR {Math.round(discountAmount / 100).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#777777]">Shipping</span>
            {shippingCost !== undefined ? (
              <span className="text-[#1E1E1E]">NPR {Math.round(shippingCost / 100).toLocaleString()}</span>
            ) : (
              <span className="text-[#777777] text-xs italic">Calculated at next step</span>
            )}
          </div>
          <div className="flex justify-between font-medium text-lg border-t border-[#F2EFEA] pt-4 mt-2 text-[#1E1E1E]">
            <span>Total</span>
            <span>NPR {Math.round(finalTotal / 100).toLocaleString()}</span>
          </div>
        </div>

        {children}

        {/* Customer Concierge Support Block */}
        <div className="mt-6 pt-6 border-t border-[#F2EFEA] space-y-1">
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#B89563] uppercase">Concierge Support</p>
          <p className="text-xs text-[#777777]">Questions about your order or sizing?</p>
          <a href="mailto:support.xinvora@gmail.com" className="text-xs font-medium text-[#1E1E1E] underline hover:text-[#B89563] transition-colors block pt-0.5">
            support.xinvora@gmail.com
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
