"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Bell, Check } from "lucide-react"
import { notifyBackInStockAction } from "@/actions/back-in-stock.actions"

interface NotifyMeButtonProps {
  productId: string
  /** "inline" = small ghost button used in cards, "full" = full-width PDP button */
  variant?: "inline" | "full"
}

export function NotifyMeButton({ productId, variant = "full" }: NotifyMeButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending || isSuccess) return

    setErrorMsg(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("productId", productId)

      const res = await notifyBackInStockAction(null, formData)
      if (res?.success) {
        setIsSuccess(true)
      } else if (res?.error) {
        setErrorMsg(res.error)
      }
    })
  }

  if (variant === "inline") {
    return (
      <div className="w-full flex flex-col gap-1">
        {isSuccess ? (
          <div className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-border/80 bg-surface text-accent text-[9px] font-bold tracking-[0.25em] uppercase select-none rounded-[6px]">
            <Check className="w-3.5 h-3.5 text-accent stroke-[2]" />
            Requested
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-border text-text-tertiary hover:text-text-primary hover:border-text-primary bg-surface/40 hover:bg-surface text-[9px] font-bold tracking-[0.25em] uppercase transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-[6px]"
            >
              <Bell className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
              {isPending ? "Requesting..." : "Notify Me"}
            </button>
          </form>
        )}
        {errorMsg && (
          <p className="text-[8px] text-red-500 text-center font-sans tracking-wide">{errorMsg}</p>
        )}
      </div>
    )
  }

  // Full PDP version — single click button
  return (
    <div className="w-full flex flex-col gap-2">
      {isSuccess ? (
        <div className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-accent/40 bg-surface text-accent text-[10px] font-bold tracking-[0.25em] uppercase rounded-[6px]">
          <Check className="w-4 h-4 text-accent stroke-[2]" />
          Back-In-Stock Request Registered
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 flex items-center justify-center gap-2 border border-border hover:border-text-primary text-text-primary text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 hover:bg-surface-elevated rounded-[6px] cursor-pointer"
          >
            <Bell className="w-4 h-4 shrink-0 stroke-[1.8]" />
            {isPending ? "Sending Request..." : "Notify Me When Available"}
          </button>
        </form>
      )}
      {errorMsg && (
        <p className="text-[9px] text-red-500 text-center font-sans tracking-wide">{errorMsg}</p>
      )}
    </div>
  )
}
