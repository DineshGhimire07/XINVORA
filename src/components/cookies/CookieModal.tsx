"use client"

import React, { useState } from "react"
import { useCookieConsent } from "./CookieProvider"
import { Button } from "@/components/ui/button"
import { X, Lock, BarChart3, Target, Sparkles } from "lucide-react"

export function CookieModal() {
  const { isModalOpen, closePreferencesModal, consentState, updatePreferences } = useCookieConsent()
  const [analytics, setAnalytics] = useState(consentState.analytics)
  const [marketing, setMarketing] = useState(consentState.marketing)
  const [personalization, setPersonalization] = useState(consentState.personalization)

  if (!isModalOpen) return null

  const handleSave = () => {
    updatePreferences({ analytics, marketing, personalization })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closePreferencesModal}
    >
      <div
        className="relative bg-white text-neutral-900 border border-neutral-200 max-w-lg w-full rounded-xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 id="cookie-modal-title" className="text-base font-serif font-light text-neutral-900 tracking-tight">
              Cookie Preference Center
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 font-light">
              Manage your privacy settings for XINVORA.
            </p>
          </div>
          <button
            type="button"
            onClick={closePreferencesModal}
            aria-label="Close modal"
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Necessary */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 flex items-start gap-3.5">
            <Lock className="h-5 w-5 text-neutral-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Necessary Cookies
                </span>
                <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase select-none">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-light mt-1 leading-relaxed">
                Essential for authentication, shopping cart functionality, security, CSRF protection, and checkout processing. Cannot be disabled.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 flex items-start gap-3.5">
            <BarChart3 className="h-5 w-5 text-[#8C6D58] shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Performance & Analytics
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 text-[#8C6D58] rounded border-neutral-300 focus:ring-[#8C6D58] cursor-pointer"
                />
              </div>
              <p className="text-xs text-neutral-600 font-light mt-1 leading-relaxed">
                Allows us to aggregate page view statistics, measure site performance, and optimize navigation speeds.
              </p>
            </div>
          </div>

          {/* Marketing */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 flex items-start gap-3.5">
            <Target className="h-5 w-5 text-[#8C6D58] shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Marketing & Advertising
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 text-[#8C6D58] rounded border-neutral-300 focus:ring-[#8C6D58] cursor-pointer"
                />
              </div>
              <p className="text-xs text-neutral-600 font-light mt-1 leading-relaxed">
                Used to deliver relevant campaign promotions across social networks and partner editorial publications.
              </p>
            </div>
          </div>

          {/* Personalization */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 flex items-start gap-3.5">
            <Sparkles className="h-5 w-5 text-[#8C6D58] shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Personalization & AI
                </span>
                <input
                  type="checkbox"
                  checked={personalization}
                  onChange={(e) => setPersonalization(e.target.checked)}
                  className="h-4 w-4 text-[#8C6D58] rounded border-neutral-300 focus:ring-[#8C6D58] cursor-pointer"
                />
              </div>
              <p className="text-xs text-neutral-600 font-light mt-1 leading-relaxed">
                Enables tailored editorial suggestions, recently viewed items, and personalized collection curation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
          <Button
            type="button"
            variant="ghost"
            onClick={closePreferencesModal}
            className="text-xs uppercase font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 px-6 bg-[#8C6D58] hover:bg-[#775B47] text-white text-xs font-bold uppercase tracking-[0.18em] rounded-md transition-all active:scale-[0.99]"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
