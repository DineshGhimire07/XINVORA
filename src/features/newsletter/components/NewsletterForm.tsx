"use client"

/**
 * features/newsletter/components/NewsletterForm.tsx — XINVORA Newsletter Form
 *
 * An interactive Client Component that executes the subscribeToNewsletter
 * Server Action using React's useActionState hook.
 *
 * Employs premium design language (micro-animations, loading spinners, and
 * success checks) while maintaining full accessibility (aria-live region).
 */

import React, { useActionState, useEffect, useRef } from "react"
import { subscribeToNewsletter } from "@/actions/newsletter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/types/actions"

export interface NewsletterFormProps {
  /**
   * Layout style.
   * - 'default': Stacked/horizontal block for homepage and page sections.
   * - 'inline': Compact inline form suited for footers or sidebars.
   */
  layout?: "default" | "inline"
  /** Placeholder text for the input field. */
  placeholder?: string
  /** Class name overrides. */
  className?: string
}

export function NewsletterForm({
  layout = "default",
  placeholder = "Email address",
  className = "",
}: NewsletterFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  
  // React 19 useActionState hook for Server Action management
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    null as ActionResult<{ email: string; subscribedAt: string }> | null
  )

  // Reset form inputs upon successful subscription
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state])

  const hasSuccess = state?.success === true
  const fieldErrors = state?.success === false ? state.error.fieldErrors : undefined
  const emailErrors = fieldErrors?.email

  // Inline Layout (Footer, Sidebars)
  if (layout === "inline") {
    return (
      <form ref={formRef} action={formAction} className={`w-full ${className}`}>
        <div className="flex items-center gap-2 border-b border-border/40 focus-within:border-text-primary transition-colors duration-300 py-1">
          <label htmlFor="newsletter-inline-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-inline-email"
            name="email"
            type="email"
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 text-sm py-1 min-w-0"
            required
            disabled={isPending || hasSuccess}
            aria-describedby={emailErrors ? "newsletter-inline-error" : undefined}
          />
          <button
            type="submit"
            className="text-text-secondary hover:text-text-primary transition-colors duration-200 p-1 select-none shrink-0"
            disabled={isPending || hasSuccess}
            aria-label="Subscribe to newsletter"
          >
            {isPending ? (
              <Spinner size="sm" className="opacity-60" />
            ) : hasSuccess ? (
              <span className="text-accent text-sm" role="img" aria-label="Subscribed successfully">✓</span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Accessibility & Visual Feedback */}
        <div aria-live="polite" className="mt-2 text-[11px]">
          {emailErrors && (
            <p id="newsletter-inline-error" className="text-red-500/90 font-medium">
              {emailErrors[0]}
            </p>
          )}
          {hasSuccess && (
            <p className="text-text-secondary">
              Thank you for subscribing.
            </p>
          )}
        </div>
      </form>
    )
  }

  // Default Section Layout (Homepage, Blog posts)
  return (
    <form
      ref={formRef}
      action={formAction}
      className={`w-full max-w-[32rem] mx-auto text-left ${className}`}
    >
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start w-full">
        <div className="flex-1 w-full">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder={placeholder}
            variant="ghost"
            size="lg"
            className="w-full"
            required
            disabled={isPending || hasSuccess}
            aria-describedby={emailErrors ? "newsletter-error" : undefined}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto shrink-0 select-none"
          disabled={isPending || hasSuccess}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Subscribing
            </span>
          ) : hasSuccess ? (
            "Subscribed"
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>

      {/* Accessibility & Visual Feedback */}
      <div aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
        {emailErrors && (
          <p id="newsletter-error" className="text-red-500/90 font-medium">
            {emailErrors[0]}
          </p>
        )}
        {hasSuccess && (
          <p className="text-text-secondary text-center sm:text-left animate-fade-in">
            Success. You are now subscribed to receive our latest updates.
          </p>
        )}
        {!hasSuccess && state?.success === false && !emailErrors && (
          <p className="text-red-500/90 font-medium">
            {state.error.message}
          </p>
        )}
      </div>
    </form>
  )
}
