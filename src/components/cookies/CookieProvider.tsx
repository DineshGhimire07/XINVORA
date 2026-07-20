"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { CookieConsentState, PrivacyCMPSettings } from "@/types/cookies"
import { saveConsentAction } from "@/actions/cookie-consent.actions"
import { parseAndVerifySignedCookie, CONSENT_COOKIE_NAME } from "@/lib/cookies/cookie"
import { emitCMPEvent } from "@/lib/cookies/events"

export const CONSENT_CONTEXT_VERSION = 1

interface CookieConsentContextType {
  contextVersion: number
  consentState: CookieConsentState
  settings: PrivacyCMPSettings | null
  isBannerOpen: boolean
  isModalOpen: boolean
  isLoaded: boolean
  acceptAll: () => Promise<void>
  rejectOptional: () => Promise<void>
  updatePreferences: (prefs: { analytics: boolean; marketing: boolean; personalization: boolean }) => Promise<void>
  openPreferencesModal: () => void
  closePreferencesModal: () => void
  closeBanner: () => void
}

const defaultState: CookieConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
  policyVersion: "1.0",
  isConsentGiven: false,
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consentState, setConsentState] = useState<CookieConsentState>(defaultState)
  const [settings, setSettings] = useState<PrivacyCMPSettings | null>(null)
  const [isBannerOpen, setIsBannerOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Fetch initial consent and settings from API
    fetch("/api/cookies/consent")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { consent, requiresReconsent, settings: fetchedSettings } = res.data
          if (fetchedSettings) setSettings(fetchedSettings)

          if (consent && !requiresReconsent) {
            setConsentState({
              necessary: true,
              analytics: consent.analytics,
              marketing: consent.marketing,
              personalization: consent.personalization,
              policyVersion: consent.policyVersion,
              isConsentGiven: true,
              consentGivenAt: consent.timestamp,
              method: consent.method,
              source: consent.source,
            })
            setIsBannerOpen(false)
          } else {
            setIsBannerOpen(true)
          }
        } else {
          setIsBannerOpen(true)
        }
      })
      .catch((err) => {
        console.error("[CookieProvider] Failed to fetch consent state:", err)
        setIsBannerOpen(true)
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [])

  const acceptAll = async () => {
    const newState: CookieConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      policyVersion: settings?.currentPolicyVersion || "1.0",
      isConsentGiven: true,
      method: "accept_all",
      source: "banner",
    }

    setConsentState(newState)
    setIsBannerOpen(false)
    setIsModalOpen(false)

    await saveConsentAction({
      analytics: true,
      marketing: true,
      personalization: true,
      policyVersion: newState.policyVersion,
      source: "banner",
      method: "accept_all",
    })

    emitCMPEvent("CONSENT_CREATED", newState)
  }

  const rejectOptional = async () => {
    const newState: CookieConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      policyVersion: settings?.currentPolicyVersion || "1.0",
      isConsentGiven: true,
      method: "reject_optional",
      source: "banner",
    }

    setConsentState(newState)
    setIsBannerOpen(false)
    setIsModalOpen(false)

    await saveConsentAction({
      analytics: false,
      marketing: false,
      personalization: false,
      policyVersion: newState.policyVersion,
      source: "banner",
      method: "reject_optional",
    })

    emitCMPEvent("CONSENT_CREATED", newState)
  }

  const updatePreferences = async (prefs: { analytics: boolean; marketing: boolean; personalization: boolean }) => {
    const newState: CookieConsentState = {
      necessary: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      personalization: prefs.personalization,
      policyVersion: settings?.currentPolicyVersion || "1.0",
      isConsentGiven: true,
      method: "custom",
      source: "preferences",
    }

    setConsentState(newState)
    setIsBannerOpen(false)
    setIsModalOpen(false)

    await saveConsentAction({
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      personalization: prefs.personalization,
      policyVersion: newState.policyVersion,
      source: "preferences",
      method: "custom",
    })

    emitCMPEvent("CONSENT_UPDATED", newState)
  }

  return (
    <CookieConsentContext.Provider
      value={{
        contextVersion: CONSENT_CONTEXT_VERSION,
        consentState,
        settings,
        isBannerOpen,
        isModalOpen,
        isLoaded,
        acceptAll,
        rejectOptional,
        updatePreferences,
        openPreferencesModal: () => setIsModalOpen(true),
        closePreferencesModal: () => setIsModalOpen(false),
        closeBanner: () => setIsBannerOpen(false),
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieProvider")
  }
  return context
}
