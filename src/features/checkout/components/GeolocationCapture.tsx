"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { MapPin, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GeolocationCaptureProps {
  onCapture: (lat: number, lng: number) => void
  onClear: () => void
  latitude?: number
  longitude?: number
}

type GeoState = "idle" | "requesting" | "success" | "denied" | "error"

export function GeolocationCapture({ onCapture, onClear, latitude, longitude }: GeolocationCaptureProps) {
  const [state, setState] = useState<GeoState>(latitude && longitude ? "success" : "idle")

  const handleCapture = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setState("error")
      return
    }

    setState("requesting")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture(position.coords.latitude, position.coords.longitude)
        setState("success")
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState("denied")
        } else {
          setState("error")
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [onCapture])

  const handleClear = () => {
    onClear()
    setState("idle")
  }

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <button
          type="button"
          onClick={handleCapture}
          className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-dashed",
            "border-accent/40 bg-accent/5 hover:bg-accent/10 hover:border-accent/60",
            "text-text-secondary hover:text-text-primary transition-all duration-200",
            "group cursor-pointer w-full sm:w-auto"
          )}
        >
          <MapPin className="w-4 h-4 text-accent shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Use Current Location</span>
        </button>
      )}

      {state === "requesting" && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-surface-secondary">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <span className="text-sm text-text-secondary">Requesting location access…</span>
        </div>
      )}

      {state === "success" && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Location Saved</p>
              {latitude && longitude && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            aria-label="Remove location"
          >
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {state === "denied" && (
        <div className="px-5 py-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Location permission denied.</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            You can continue — your address details are sufficient for delivery.
          </p>
          <button
            type="button"
            onClick={handleCapture}
            className="mt-2 text-xs text-amber-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="px-5 py-3 rounded-xl border border-border bg-surface-secondary">
          <p className="text-sm text-text-secondary">Could not retrieve location. Your address details are sufficient.</p>
          <button
            type="button"
            onClick={handleCapture}
            className="mt-1 text-xs text-accent underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {state === "idle" && (
        <p className="text-xs text-text-tertiary">
          Optional — helps our delivery partner locate you more accurately.
        </p>
      )}
    </div>
  )
}
