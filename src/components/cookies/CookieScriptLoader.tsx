"use client"

import React from "react"
import Script from "next/script"
import { useCookieConsent } from "./CookieProvider"
import { cookieScriptRegistry } from "@/lib/cookies/registry"

export function CookieScriptLoader() {
  const { consentState, settings } = useCookieConsent()

  if (!consentState.isConsentGiven || !settings) return null

  // Sort scripts by priority (lower number = higher priority)
  const activeScripts = cookieScriptRegistry
    .filter((script) => {
      // 1. Check if category is consented to
      const categoryConsented = consentState[script.category] === true
      if (!categoryConsented) return false

      // 2. Check if admin setting for script flag is enabled
      const scriptFlagEnabled = settings.scriptFlags?.[script.flagKey] ?? true
      return scriptFlagEnabled
    })
    .sort((a, b) => a.priority - b.priority)

  return (
    <>
      {activeScripts.map((script) => {
        if (script.inlineScript) {
          return (
            <Script
              key={script.id}
              id={script.id}
              strategy={script.strategy}
              dangerouslySetInnerHTML={{
                __html: script.inlineScript(""),
              }}
            />
          )
        } else if (script.src) {
          return (
            <Script
              key={script.id}
              id={script.id}
              src={script.src}
              strategy={script.strategy}
            />
          )
        }
        return null
      })}
    </>
  )
}
