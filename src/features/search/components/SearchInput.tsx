"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAnalytics } from "@/features/analytics/ingestion/tracking-provider"
import { AnalyticsEvent } from "@/features/analytics/events/registry"

interface SearchInputProps {
  /** Number of results from the previous search, passed in by the server page
   *  after the query resolves. Used to populate the SEARCH event payload.
   *  If omitted (e.g. on initial render without a query), resultsCount = 0. */
  resultsCount?: number
}

export function SearchInput({ resultsCount = 0 }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = React.useState(initialQuery)
  const { trackEvent } = useAnalytics()

  // When the parent server component re-renders after a new search result,
  // it passes the updated resultsCount. Sync local query state if the URL param changes.
  React.useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()

    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      // Analytics: SEARCH — fire after triggering navigation.
      // resultsCount will be 0 here on the first submission; the server page
      // re-renders and passes the accurate resultsCount via prop on the next render.
      trackEvent(AnalyticsEvent.SEARCH, {
        query: trimmed,
        resultsCount,
      })
    } else {
      router.push(`/search`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search terms..."
        className="w-full h-12 px-4 bg-surface border border-border text-body-sm text-text-primary rounded-sm transition-colors focus:border-text-primary focus:outline-none"
        autoFocus
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-body-xs font-semibold uppercase transition-colors"
      >
        Search
      </button>
    </form>
  )
}
