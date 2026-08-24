"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function PDPBackButton({
  fallbackUrl = "/",
  label = "Back",
  className = "",
}: {
  fallbackUrl?: string
  label?: string
  className?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackUrl)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors py-2 px-1 group text-xs uppercase tracking-widest font-mono select-none cursor-pointer ${className || "mb-3 -ml-1"}`}
      aria-label={`Back to previous page`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="font-medium text-[11px] tracking-wider">{label}</span>
    </button>
  )
}
