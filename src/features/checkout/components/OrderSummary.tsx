"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CartResult } from "@/db/queries/types"

export function OrderSummary({ cart }: { cart: CartResult }) {
  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  
  return (
    <Card className="rounded-none border-border-primary/40 shadow-sm bg-white">
      <CardHeader className="border-b border-border-primary/20">
        <CardTitle className="text-lg font-light tracking-wide uppercase">Order Summary</CardTitle>
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
                <p className="text-sm text-gray-500 mt-1">
                  {item.variant.color?.name && `${item.variant.color.name}`}
                  {item.variant.color?.name && item.variant.size?.name && " / "}
                  {item.variant.size?.name && `${item.variant.size.name}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium pt-1">
                NPR {Math.round((item.price * item.quantity) / 100).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-border-primary/20 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-500 text-xs italic">Calculated at next step</span>
          </div>
          <div className="flex justify-between font-medium text-lg border-t border-border-primary/20 pt-4 mt-2">
            <span>Total</span>
            <span>NPR {Math.round(subtotal / 100).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
