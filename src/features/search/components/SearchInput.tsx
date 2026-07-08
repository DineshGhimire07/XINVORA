"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [query, setQuery] = React.useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
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
      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-body-xs font-semibold uppercase transition-colors">
        Search
      </button>
    </form>
  )
}
