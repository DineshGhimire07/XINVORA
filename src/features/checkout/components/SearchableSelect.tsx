"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = { id: string; label: string }

interface SearchableSelectProps {
  id?: string
  options: Option[]
  value: string
  onChange: (id: string, label: string) => void
  placeholder: string
  disabled?: boolean
  error?: string
  loading?: boolean
}

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  loading = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = React.useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const selected = options.find((o) => o.id === value)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (opt: Option) => {
    onChange(opt.id, opt.label)
    setOpen(false)
    setQuery("")
  }

  return (
    <div ref={ref} className="relative" id={id}>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? `Loading ${placeholder.toLowerCase()}...` : ""}
      </span>
      <span className="sr-only" aria-live="polite">
        {!loading && open ? `${filtered.length} options available` : ""}
      </span>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => !disabled && !loading && setOpen((o) => !o)}
        aria-busy={loading}
        aria-live="polite"
        className={cn(
          "w-full flex items-center justify-between gap-2 h-12 px-4 rounded-lg border text-sm transition-all duration-200",
          "bg-white dark:bg-[#1a1a1a] text-left",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(25,22%,56%)] focus:ring-offset-0",
          disabled || loading
            ? "border-border cursor-not-allowed opacity-50 bg-surface-secondary"
            : "border-border hover:border-border-strong cursor-pointer",
          error ? "border-red-400" : "",
          open ? "border-[hsl(25,22%,56%)] ring-2 ring-[hsl(25,22%,56%)/20%]" : ""
        )}
      >
        <span className={cn("truncate", !selected && "text-text-tertiary")}>
          {loading ? "Loading..." : selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-text-tertiary transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1e1e] border border-border rounded-lg shadow-lg overflow-hidden">
          {options.length > 8 && (
            <div className="px-3 pt-3 pb-2 border-b border-border">
              <div className="flex items-center gap-2 bg-surface-secondary rounded-md px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                />
              </div>
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-text-tertiary text-center">No results found</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left",
                      "hover:bg-surface-secondary transition-colors",
                      opt.id === value ? "text-text-primary font-medium" : "text-text-secondary"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.id === value && <Check className="w-4 h-4 text-accent shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
