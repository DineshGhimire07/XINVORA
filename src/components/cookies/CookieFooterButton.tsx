"use client"

import React from "react"
import { useCookieConsent } from "./CookieProvider"
import { ShieldCheck } from "lucide-react"

export function CookieFooterButton() {
  const { openPreferencesModal } = useCookieConsent()

  return (
    <button
      type="button"
      onClick={openPreferencesModal}
      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
      aria-label="Manage Cookie Preferences"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-[#C8A97E]" />
      <span>Cookie Preferences</span>
    </button>
  )
}
