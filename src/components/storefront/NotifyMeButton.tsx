"use client"

import * as React from "react"
import { useActionState } from "react"
import { Bell, Check } from "lucide-react"
import { notifyBackInStockAction } from "@/actions/back-in-stock.actions"

interface NotifyMeButtonProps {
  productId: string
  /** "inline" = small ghost button used in cards, "full" = full-width PDP button */
  variant?: "inline" | "full"
}

export function NotifyMeButton({ productId, variant = "full" }: NotifyMeButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [state, action, isPending] = useActionState<any, FormData>(notifyBackInStockAction, null)

  // Close panel on success after a short delay
  React.useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => setOpen(false), 3500)
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
            Request sent!
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-1.5 w-full">
            <input type="hidden" name="productId" value={productId} />
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              className="w-full px-2.5 py-1.5 text-[9px] font-sans tracking-wide border border-neutral-300 focus:border-neutral-700 focus:outline-none placeholder:text-neutral-400 bg-white"
            />
            <div className="flex items-stretch gap-1">
              <input
                name="phone"
                type="tel"
                placeholder="+977 98..."
                required
                className="flex-1 min-w-0 px-2.5 py-1.5 text-[9px] font-sans tracking-wide border border-neutral-300 focus:border-neutral-700 focus:outline-none placeholder:text-neutral-400 bg-white"
              />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center px-3 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 shrink-0 text-[9px] font-bold tracking-wide"
              >
                {isPending ? "..." : "Notify"}
              </button>
            </div>
            {state?.error && (
              <p className="text-[8px] text-red-500 tracking-wide">{state.error}</p>
            )}
          </form>
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
        <div className="w-full flex flex-col items-center justify-center gap-2 py-4 border border-neutral-200 bg-neutral-50">
          <Check className="w-5 h-5 text-neutral-700" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-600">
            We&apos;ll reach out when it&apos;s back!
          </p>
          <p className="text-[9px] text-neutral-500 tracking-wide">
            Your request has been sent to the team.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 border border-neutral-200 p-4 bg-neutral-50/50">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
            Get notified when back in stock
          </p>
          <form action={action} className="flex flex-col gap-2.5">
            <input type="hidden" name="productId" value={productId} />
            <input
              name="name"
              type="text"
              placeholder="Your full name"
              required
              className="w-full h-10 px-3 text-[11px] font-sans tracking-wide border border-neutral-300 focus:border-neutral-800 focus:outline-none placeholder:text-neutral-400 bg-white"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone number (+977 98...)"
              required
              className="w-full h-10 px-3 text-[11px] font-sans tracking-wide border border-neutral-300 focus:border-neutral-800 focus:outline-none placeholder:text-neutral-400 bg-white"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Bell className="w-3.5 h-3.5" />
              {isPending ? "Sending..." : "Send Notification Request"}
            </button>
          </form>
          {state?.error && (
            <p className="text-[10px] text-red-500 text-center tracking-wide font-sans">{state.error}</p>
          )}
          <button
            onClick={() => setOpen(false)}
            className="text-[9px] text-neutral-400 hover:text-neutral-600 tracking-widest uppercase text-center transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
