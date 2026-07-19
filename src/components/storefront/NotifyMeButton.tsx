"use client"

import * as React from "react"
import { useActionState } from "react"
import { Bell, ArrowRight, Check } from "lucide-react"
import { notifyBackInStockAction } from "@/actions/back-in-stock.actions"

interface NotifyMeButtonProps {
  productId: string
  /** "inline" = small ghost button used in cards, "full" = full-width PDP button */
  variant?: "inline" | "full"
}

export function NotifyMeButton({ productId, variant = "full" }: NotifyMeButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [state, action, isPending] = useActionState<any, FormData>(notifyBackInStockAction, null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus email input when drawer opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Close panel on success after a short delay
  React.useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => setOpen(false), 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  if (variant === "inline") {
    // Compact version for product cards
    return (
      <div className="w-full">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 hover:border-neutral-600 text-neutral-500 hover:text-neutral-800 text-[8px] font-bold tracking-[0.28em] uppercase transition-all duration-300"
          >
            <Bell className="w-2.5 h-2.5 shrink-0" />
            Notify Me
          </button>
        ) : state?.success ? (
          <div className="flex items-center justify-center gap-1.5 py-2 text-[8px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
            <Check className="w-3 h-3 text-neutral-600" />
            We&apos;ll notify you!
          </div>
        ) : (
          <form action={action} className="flex items-stretch gap-1 w-full">
            <input type="hidden" name="productId" value={productId} />
            <input
              ref={inputRef}
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 px-2.5 py-2 text-[9px] font-sans tracking-wide border border-neutral-300 focus:border-neutral-700 focus:outline-none placeholder:text-neutral-400 bg-white"
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center px-3 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        )}
        {state && !state.success && state.error && (
          <p className="text-[8px] text-red-500 mt-1 text-center tracking-wide">{state.error}</p>
        )}
      </div>
    )
  }

  // Full PDP version
  return (
    <div className="w-full flex flex-col gap-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-12 flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-800 text-neutral-700 hover:text-neutral-900 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 hover:bg-neutral-50"
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          Notify Me When Available
        </button>
      ) : state?.success ? (
        <div className="w-full h-12 flex items-center justify-center gap-2 border border-neutral-200 bg-neutral-50 text-neutral-500 text-[10px] font-bold tracking-[0.25em] uppercase">
          <Check className="w-4 h-4 text-neutral-600" />
          You&apos;re on the list!
        </div>
      ) : (
        <form action={action} className="flex items-stretch gap-0 w-full">
          <input type="hidden" name="productId" value={productId} />
          <input
            ref={inputRef}
            name="email"
            type="email"
            placeholder="Enter your email address"
            required
            className="flex-1 min-w-0 px-4 h-12 text-[11px] font-sans tracking-wide border border-neutral-300 border-r-0 focus:border-neutral-800 focus:outline-none placeholder:text-neutral-400 bg-white"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-12 px-5 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            {isPending ? "…" : (
              <>
                <Bell className="w-3.5 h-3.5" />
                Notify Me
              </>
            )}
          </button>
        </form>
      )}
      {state && !state.success && state.error && (
        <p className="text-[10px] text-red-500 text-center tracking-wide font-sans">{state.error}</p>
      )}
    </div>
  )
}
