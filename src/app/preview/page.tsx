"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PREVIEW_CONFIG } from "@/config/preview"

export default function PreviewPage() {
  const [accessKey, setAccessKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (accessKey === PREVIEW_CONFIG.accessKey) {
      // Set the access cookie (30 days duration)
      document.cookie = `${PREVIEW_CONFIG.cookieName}=${PREVIEW_CONFIG.accessKey}; path=/; max-age=${PREVIEW_CONFIG.cookieMaxAge}; SameSite=Lax`
      
      // Force reload to homepage so middleware registers the new cookie
      window.location.href = "/"
    } else {
      setError("Invalid access key.")
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md w-full flex flex-col items-center gap-12">
        {/* Brand Logo */}
        <span className="text-[1.5rem] md:text-[1.85rem] font-display font-light tracking-[0.25em] uppercase text-text-primary">
          XINVORA
        </span>

        {/* Info Content */}
        <div className="flex flex-col gap-4">
          <h1 className="text-[1.75rem] md:text-[2rem] font-display font-light uppercase tracking-widest text-text-primary">
            Private Preview
          </h1>
          <p className="text-body-sm text-text-secondary max-w-sm mx-auto leading-relaxed font-light">
            XINVORA is currently in private preview. Please enter the access key to continue.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="ENTER ACCESS KEY"
              className="w-full h-12 bg-transparent border border-border text-center text-body-sm tracking-widest uppercase focus:outline-none focus:border-text-primary transition-colors text-text-primary placeholder:text-text-tertiary placeholder:font-light"
              required
              autoFocus
            />
            {error && (
              <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-text-primary hover:bg-text-secondary text-surface text-body-sm font-semibold tracking-[0.25em] uppercase transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
