"use client"

import React from "react"
import { useCookieConsent } from "./CookieProvider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function CookieBanner() {
  const { isBannerOpen, settings, acceptAll, rejectOptional, openPreferencesModal } = useCookieConsent()

  if (!isBannerOpen || !settings?.enabled) return null

  return (
    <aside
      aria-label="Cookie Consent Banner"
      role="region"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 animate-slide-up"
    >
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-7 rounded-lg sm:rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-md flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#C8A97E] shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C8A97E] font-serif">
            {settings.bannerTitle || "WE VALUE YOUR PRIVACY"}
          </h2>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-300 font-light leading-relaxed text-pretty">
          {settings.bannerDescription ||
            "We use cookies to tailor your browsing experience, deliver personalized recommendations, and analyze site traffic for quiet luxury."}{" "}
          <Link
            href={settings.privacyPolicyUrl || "/privacy"}
            className="text-white underline underline-offset-4 hover:text-[#C8A97E] transition-colors font-medium"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <Button
            type="button"
            onClick={acceptAll}
            className="flex-1 h-10 bg-[#8C6D58] hover:bg-[#775B47] text-white font-bold text-xs uppercase tracking-[0.18em] rounded-md transition-all active:scale-[0.99]"
          >
            Accept All
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={rejectOptional}
            className="h-10 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-md transition-colors"
          >
            Reject Optional
          </Button>

          <button
            type="button"
            onClick={openPreferencesModal}
            className="text-[11px] font-semibold tracking-wider text-neutral-400 hover:text-white uppercase underline underline-offset-4 text-center py-2 sm:px-2 transition-colors"
          >
            Customize
          </button>
        </div>
      </div>
    </aside>
  )
}
