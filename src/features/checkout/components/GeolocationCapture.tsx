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
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      if (res.ok) {
        const data = await res.json()
        const name = data.address?.suburb || data.address?.city || data.address?.town || data.address?.county
        if (name) setAddressLabel(name)
      }
    } catch {
      // Non-critical, ignore lookup failure
    }
  }

  const handleCapture = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setState("error")
      return
    }

    setState("requesting")

    const successCallback = (position: GeolocationPosition) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      onCapture(lat, lng)
      setState("success")
      reverseGeocode(lat, lng)
    }

    // Tier 1: Try GPS high accuracy with 4s timeout
    navigator.geolocation.getCurrentPosition(
      successCallback,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState("denied")
          return
        }
        // Tier 2 Fallback: Standard Wi-Fi / Network positioning (works instantly on desktop & laptops)
        navigator.geolocation.getCurrentPosition(
          successCallback,
          () => setState("error"),
          { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
        )
      },
      { timeout: 4000, enableHighAccuracy: true, maximumAge: 30000 }
    )
  }, [onCapture])

  const handleClear = () => {
    onClear()
    setAddressLabel(null)
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
            "border-[#B89563]/40 bg-[#FAF8F5] hover:bg-white hover:border-[#B89563]",
            "text-[#1E1E1E] transition-all duration-200",
            "group cursor-pointer w-full sm:w-auto shadow-2xs"
          )}
        >
          <MapPin className="w-4 h-4 text-[#B89563] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Use Current Location</span>
        </button>
      )}

      {state === "requesting" && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#E8DED2] bg-[#FAF8F5]">
          <Loader2 className="w-4 h-4 text-[#B89563] animate-spin" />
          <span className="text-sm text-[#1E1E1E]">Detecting current location…</span>
        </div>
      )}

      {state === "success" && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">
                {addressLabel ? `Location Saved: ${addressLabel}` : "GPS Coordinates Saved"}
              </p>
              {latitude && longitude && (
                <p className="text-xs text-emerald-700 font-mono">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded. hover:bg-emerald-200/60 transition-colors"
            aria-label="Remove location"
          >
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {state === "denied" && (
        <div className="px-5 py-3 rounded-xl border border-amber-200 bg-amber-50/60">
          <p className="text-sm font-medium text-amber-900 mb-0.5">Location permission denied by browser.</p>
          <p className="text-xs text-amber-700">
            No problem! Your entered address details are sufficient for delivery.
          </p>
          <button
            type="button"
            onClick={handleCapture}
            className="mt-2 text-xs font-semibold text-amber-800 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="px-5 py-3 rounded-xl border border-[#E8DED2] bg-[#FAF8F5]">
          <p className="text-sm text-[#1E1E1E]">Location detection timed out. Your address details above are sufficient.</p>
          <button
            type="button"
            onClick={handleCapture}
            className="mt-1 text-xs text-[#B89563] font-semibold underline hover:no-underline"
          >
            Retry location capture
          </button>
        </div>
      )}

      {state === "idle" && (
        <p className="text-xs text-[#777777]">
          Optional — helps our delivery courier pinpoint your delivery location accurately.
        </p>
      )}
    </div>
  )
}
