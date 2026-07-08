"use client"

import * as React from "react"
import { MapPin, User, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddressPreviewProps {
  fullName?: string
  phone?: string
  wardNumber?: number
  municipalityName?: string
  districtName?: string
  provinceName?: string
  tole?: string
  street?: string
  landmark?: string
  latitude?: number
  longitude?: number
}

export function AddressPreview({
  fullName,
  phone,
  wardNumber,
  municipalityName,
  districtName,
  provinceName,
  tole,
  street,
  landmark,
  latitude,
  longitude,
}: AddressPreviewProps) {
  const hasAnyContent =
    fullName || phone || wardNumber || municipalityName || districtName || provinceName || tole

  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-[#1a1a1a] overflow-hidden transition-all duration-300",
        hasAnyContent ? "border-border shadow-sm" : "border-dashed border-border opacity-60"
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-surface-secondary/50 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Delivery Address Preview
        </span>
      </div>

      <div className="p-4">
        {!hasAnyContent ? (
          <p className="text-sm text-text-tertiary text-center py-4">
            Your address will appear here as you fill the form.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Recipient */}
            {(fullName || phone) && (
              <div className="pb-3 border-b border-border/50">
                {fullName && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                    <p className="text-sm font-semibold text-text-primary">{fullName}</p>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                    <p className="text-sm text-text-secondary">+977 {phone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Address lines */}
            <div className="space-y-0.5 text-sm text-text-secondary leading-relaxed">
              {wardNumber && municipalityName && (
                <p className="font-medium text-text-primary">
                  Ward {wardNumber}, {municipalityName}
                </p>
              )}
              {!municipalityName && wardNumber && (
                <p>Ward {wardNumber}</p>
              )}
              {municipalityName && !wardNumber && (
                <p className="font-medium text-text-primary">{municipalityName}</p>
              )}
              {districtName && <p>{districtName}</p>}
              {provinceName && <p>{provinceName}</p>}
              {tole && <p className="mt-1">{tole}</p>}
              {street && <p>{street}</p>}
              {landmark && <p className="text-text-tertiary text-xs">{landmark}</p>}
              <p className="text-text-tertiary text-xs mt-1">Nepal</p>
            </div>

            {/* Geolocation badge */}
            {latitude && longitude && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Location captured
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
