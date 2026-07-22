"use client"

import React from "react"
import { useCookieConsent } from "./CookieProvider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, X } from "lucide-react"

export function CookieBanner() {
  const { isBannerOpen, settings, acceptAll, rejectOptional, openPreferencesModal, closeBanner } = useCookieConsent()

  if (!isBannerOpen || !settings?.enabled) return null

  return (
    <aside
      aria-label="Cookie Consent Banner"
      role="region"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 md:left-8 md:right-auto md:max-w-lg z-[100] animate-slide-up select-none"
    >
      <div className="bg-[#121212]/95 backdrop-blur-xl text-white p-5 sm:p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-800/80 flex flex-col gap-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C8A97E] shrink-0" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C8A97E] font-serif">
              {settings.bannerTitle || "WE VALUE YOUR PRIVACY"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeBanner}
            aria-label="Dismiss banner"
            className="text-neutral-400 hover:text-white transition-colors p-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
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
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              type="button"
              onClick={acceptAll}
              className="w-full h-10 bg-[#C8A97E] hover:bg-[#b8986d] text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              Accept All
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={rejectOptional}
              className="w-full h-10 border-neutral-700/80 bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Reject
            </Button>
          </div>

          <button
            type="button"
            onClick={openPreferencesModal}
            className="text-[10px] font-semibold tracking-widest text-neutral-400 hover:text-[#C8A97E] uppercase underline underline-offset-4 text-center py-1 transition-colors"
          >
            Customize Preferences
          </button>
        </div>
      </div>
    </aside>
  )
}
