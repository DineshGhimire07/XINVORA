"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function PDPBackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors py-2 px-1 group mb-3 -ml-1 text-xs uppercase tracking-widest font-mono select-none"
      aria-label="Back to previous page"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="font-medium text-[11px] tracking-wider">Back</span>
    </button>
  )
}
