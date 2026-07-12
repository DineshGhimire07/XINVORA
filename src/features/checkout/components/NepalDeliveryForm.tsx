"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { NepalDeliverySchema, type NepalDeliveryFormValues } from "@/validations/checkout"
import { submitCheckoutAction } from "@/actions/checkout.actions"
import { uploadCustomerLocalFileAction } from "@/actions/customer.media.actions"
import { SearchableSelect } from "./SearchableSelect"
import { GeolocationCapture } from "./GeolocationCapture"
import { PaymentMethodSelector } from "./PaymentMethodSelector"
import { AddressPreview } from "./AddressPreview"
import { cn } from "@/lib/utils"

import type { NepalProvince, NepalDistrict, NepalMunicipality } from "@/db/queries/nepal"

// ─── Form Field ──────────────────────────────────────────────────────────────
function FormField({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-error shrink-0" />
          <p className="text-xs text-error">{error}</p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 space-y-1">
      <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">Step {number}</p>
      <h2 className="text-2xl font-display font-light tracking-wide text-text-primary">{title}</h2>
      {subtitle && <p className="text-sm text-text-tertiary">{subtitle}</p>}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
const inputClass = cn(
  "w-full h-12 px-4 rounded-lg border border-border bg-surface",
  "text-sm text-text-primary placeholder:text-text-tertiary",
  "transition-all duration-200 outline-none",
  "focus:border-accent focus:ring-2 focus:ring-accent/20",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary"
)

// ─── Main Component ───────────────────────────────────────────────────────────
interface NepalDeliveryFormProps {
  provinces: NepalProvince[]
  savedAddress?: any
  initialDistricts?: NepalDistrict[]
  initialMunicipalities?: NepalMunicipality[]
  paymentQrs?: any
  onSuccess?: (data: NepalDeliveryFormValues) => void
  initialData?: NepalDeliveryFormValues | null
}

export function NepalDeliveryForm({
  provinces,
  savedAddress,
  initialDistricts = [],
  initialMunicipalities = [],
  paymentQrs,
  onSuccess,
  initialData,
}: NepalDeliveryFormProps) {
  const router = useRouter()
  const [districts, setDistricts] = useState<NepalDistrict[]>(initialDistricts)
  const [municipalities, setMunicipalities] = useState<NepalMunicipality[]>(initialMunicipalities)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const idempotencyKeyRef = React.useRef<string | null>(null)

  // Use refs to track if the values are seeded from mount so we don't trigger cascade wipes
  const isInitialMountRef = React.useRef(true)
  
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Display names for preview (initial values based on savedAddress names if available)
  const [provinceName, setProvinceName] = useState(savedAddress?.province?.name || "")
  const [districtName, setDistrictName] = useState(savedAddress?.district?.name || "")
  const [municipalityName, setMunicipalityName] = useState(savedAddress?.municipality?.name || "")

  // Ward count from selected municipality (pre-seed if initialMunicipalities has it)
  const matchedMuni = initialMunicipalities.find((m) => m.id === savedAddress?.municipalityId)
  const [totalWards, setTotalWards] = useState(matchedMuni?.totalWards || 9)

  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NepalDeliveryFormValues>({
    resolver: zodResolver(NepalDeliverySchema as any),
    defaultValues: {
      fullName: savedAddress?.fullName || "",
      phone: savedAddress?.phone || "",
      provinceId: savedAddress?.provinceId || "",
      districtId: savedAddress?.districtId || "",
      municipalityId: savedAddress?.municipalityId || "",
      wardNumber: savedAddress?.wardNumber || undefined,
      tole: savedAddress?.tole || "",
      street: savedAddress?.street || "",
      landmark: savedAddress?.landmark || "",
      deliveryNote: "",
      latitude: savedAddress?.latitude || undefined,
      longitude: savedAddress?.longitude || undefined,
      saveAddress: false,
      paymentMethod: "COD",
      provinceName: savedAddress?.province?.name || "",
      districtName: savedAddress?.district?.name || "",
      municipalityName: savedAddress?.municipality?.name || "",
    },
  })

  const watchedValues = watch()
  const selectedProvinceId = watch("provinceId")
  const selectedDistrictId = watch("districtId")
  const selectedMunicipalityId = watch("municipalityId")

  // On initial render finish, turn off the mount guard ref
  useEffect(() => {
    isInitialMountRef.current = false
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    // Mount safety check: If it's initial mount and we already have districts, skip resetting/fetching
    if (isInitialMountRef.current && districts.length > 0) {
      return
    }

    if (!selectedProvinceId) {
      setDistricts([])
      setMunicipalities([])
      setValue("districtId", "")
      setValue("municipalityId", "")
      setValue("wardNumber", undefined as any)
      setDistrictName("")
      setMunicipalityName("")
      return
    }
    setLoadingDistricts(true)
    fetch(`/api/nepal/districts?provinceId=${selectedProvinceId}`)
      .then((r) => r.json())
      .then((data) => {
        setDistricts(data)
        setMunicipalities([])
        setValue("districtId", "")
        setValue("municipalityId", "")
        setValue("wardNumber", undefined as any)
        setDistrictName("")
        setMunicipalityName("")
      })
      .finally(() => setLoadingDistricts(false))
  }, [selectedProvinceId, setValue])

  // Fetch municipalities when district changes
  useEffect(() => {
    // Mount safety check: If it's initial mount and we already have municipalities, skip resetting/fetching
    if (isInitialMountRef.current && municipalities.length > 0) {
      return
    }

    if (!selectedDistrictId) {
      setMunicipalities([])
      setValue("municipalityId", "")
      setValue("wardNumber", undefined as any)
      setMunicipalityName("")
      return
    }
    setLoadingMunicipalities(true)
    fetch(`/api/nepal/municipalities?districtId=${selectedDistrictId}`)
      .then((r) => r.json())
      .then((data) => {
        setMunicipalities(data)
        setValue("municipalityId", "")
        setValue("wardNumber", undefined as any)
        setMunicipalityName("")
      })
      .finally(() => setLoadingMunicipalities(false))
  }, [selectedDistrictId, setValue])

  // Update ward count when municipality changes
  useEffect(() => {
    if (!selectedMunicipalityId) return
    const muni = municipalities.find((m) => m.id === selectedMunicipalityId)
    if (muni) {
      setTotalWards(muni.totalWards)
      // Only clear wardNumber if NOT on initial mount
      if (!isInitialMountRef.current && watchedValues.wardNumber !== savedAddress?.wardNumber) {
        setValue("wardNumber", undefined as any)
      }
      setValue("municipalityName", muni.name)
      setValue("municipalityType", muni.type)
      setMunicipalityName(muni.name)
    }
  }, [selectedMunicipalityId, municipalities, setValue])

  const handleGeoCapture = useCallback(
    (lat: number, lng: number) => {
      setValue("latitude", lat)
      setValue("longitude", lng)
    },
    [setValue]
  )

  const handleGeoClear = useCallback(() => {
    setValue("latitude", undefined)
    setValue("longitude", undefined)
  }, [setValue])

  const onSubmit = async (data: NepalDeliveryFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    if (onSuccess) {
      onSuccess({
        ...data,
        provinceName,
        districtName,
        municipalityName,
      })
      setIsSubmitting(false)
      return
    }
  }


  const provinceOptions = provinces.map((p) => ({ id: p.id, label: p.name }))
  const districtOptions = districts.map((d) => ({ id: d.id, label: d.name }))
  const municipalityOptions = municipalities.map((m) => ({ id: m.id, label: m.name }))
  const wardOptions = Array.from({ length: totalWards }, (_, i) => ({
    id: String(i + 1),
    label: `Ward ${i + 1}`,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
      <div className="space-y-6">

        {/* ─── Section 1: Recipient ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5">
            <SectionHeader number={1} title="Recipient Information" />

            <div className="space-y-5">
              {/* Full Name */}
              <FormField label="Full Name" required error={errors.fullName?.message}>
                <input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Dinesh Ghimire"
                  autoComplete="name"
                  className={cn(inputClass, errors.fullName && "border-error focus:border-error focus:ring-error/20")}
                />
              </FormField>

              {/* Phone */}
              <FormField
                label="Phone Number"
                required
                error={errors.phone?.message}
                hint="Nepal mobile numbers starting with 98, 97, or 96"
              >
                <div className="flex">
                  <div className="flex items-center px-3 h-12 rounded-l-lg border border-r-0 border-border bg-surface-secondary text-sm text-text-secondary font-medium select-none">
                    +977
                  </div>
                  <input
                    id="phone"
                    {...register("phone")}
                    placeholder="9812345678"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    className={cn(
                      inputClass,
                      "rounded-l-none",
                      errors.phone && "border-error focus:border-error focus:ring-error/20"
                    )}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </motion.div>

        {/* ─── Section 2: Address ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5">
            <SectionHeader
              number={2}
              title="Delivery Address"
              subtitle="Select your province, district, and municipality"
            />

            <div className="space-y-5">
              {/* Province */}
              <FormField label="Province" required error={errors.provinceId?.message}>
                <Controller
                  name="provinceId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="province-select"
                      options={provinceOptions}
                      value={field.value}
                      onChange={(id, label) => {
                        field.onChange(id)
                        setValue("provinceName", label)
                        setProvinceName(label)
                      }}
                      placeholder="Select Province"
                      error={errors.provinceId?.message}
                    />
                  )}
                />
              </FormField>

              {/* District */}
              <FormField label="District" required error={errors.districtId?.message}>
                <Controller
                  name="districtId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="district-select"
                      options={districtOptions}
                      value={field.value}
                      onChange={(id, label) => {
                        field.onChange(id)
                        setValue("districtName", label)
                        setDistrictName(label)
                      }}
                      placeholder={selectedProvinceId ? "Select District" : "Select a Province first"}
                      disabled={!selectedProvinceId}
                      loading={loadingDistricts}
                      error={errors.districtId?.message}
                    />
                  )}
                />
              </FormField>

              {/* Municipality */}
              <FormField label="Municipality / Rural Municipality" required error={errors.municipalityId?.message}>
                <Controller
                  name="municipalityId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="municipality-select"
                      options={municipalityOptions}
                      value={field.value}
                      onChange={(id, label) => {
                        field.onChange(id)
                      }}
                      placeholder={selectedDistrictId ? "Select Municipality" : "Select a District first"}
                      disabled={!selectedDistrictId}
                      loading={loadingMunicipalities}
                      error={errors.municipalityId?.message}
                    />
                  )}
                />
              </FormField>

              {/* Ward */}
              <FormField label="Ward" required error={errors.wardNumber?.message}>
                <Controller
                  name="wardNumber"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="ward-select"
                      options={wardOptions}
                      value={field.value ? String(field.value) : ""}
                      onChange={(id) => field.onChange(parseInt(id))}
                      placeholder={selectedMunicipalityId ? "Select Ward" : "Select a Municipality first"}
                      disabled={!selectedMunicipalityId}
                      error={errors.wardNumber?.message}
                    />
                  )}
                />
              </FormField>

              {/* Tole */}
              <FormField label="Tole / Area / Village" required error={errors.tole?.message}>
                <input
                  id="tole"
                  {...register("tole")}
                  placeholder="e.g. Golpark, Traffic Chowk, Deepnagar"
                  className={cn(inputClass, errors.tole && "border-error focus:border-error focus:ring-error/20")}
                />
              </FormField>

              {/* Street */}
              <FormField label="Street / House Number" error={errors.street?.message}>
                <input
                  id="street"
                  {...register("street")}
                  placeholder="House Number, Building Name, Street"
                  className={cn(inputClass, errors.street && "border-error focus:border-error focus:ring-error/20")}
                />
              </FormField>

              {/* Landmark */}
              <FormField label="Landmark" error={errors.landmark?.message}>
                <input
                  id="landmark"
                  {...register("landmark")}
                  placeholder="Near Bhatbhateni, Opposite Laxmi Bank…"
                  className={cn(inputClass, errors.landmark && "border-error focus:border-error focus:ring-error/20")}
                />
              </FormField>

              {/* Delivery Note */}
              <FormField label="Delivery Instructions">
                <textarea
                  id="deliveryNote"
                  {...register("deliveryNote")}
                  rows={3}
                  placeholder="Anything our delivery partner should know? Ring the bell · Call before arriving · Leave with security…"
                  className={cn(
                    inputClass,
                    "h-auto py-3 resize-none leading-relaxed",
                  )}
                />
              </FormField>
            </div>
          </div>
        </motion.div>

        {/* ─── Section 3: Location ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5">
            <SectionHeader
              number={3}
              title="Location"
              subtitle="Help our delivery partner locate your address more accurately."
            />
            <GeolocationCapture
              onCapture={handleGeoCapture}
              onClear={handleGeoClear}
              latitude={watchedValues.latitude}
              longitude={watchedValues.longitude}
            />
          </div>
        </motion.div>



        {/* ─── Save Address ─────────────────────────────────────────────────── */}
        <div className="px-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="saveAddress"
                {...register("saveAddress")}
                className="peer sr-only"
              />
              <div className={cn(
                "w-5 h-5 rounded border-2 border-border transition-all",
                "peer-checked:border-accent peer-checked:bg-accent",
                "group-hover:border-accent/60"
              )}>
                <svg
                  className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Save this address for future orders
            </span>
          </label>
        </div>

        {/* ─── Server Error ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-muted border border-error/20 text-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Submit Button ────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          id="place-order-btn"
          className={cn(
            "w-full h-14 rounded-lg font-semibold text-sm uppercase tracking-widest",
            "bg-text-primary text-white",
            "hover:bg-ink transition-all duration-200",
            "flex items-center justify-center gap-2",
            "shadow-lg hover:shadow-xl active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Order…</span>
            </>
          ) : (
            <>
              <span>Continue to Payment</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-tertiary">
          By placing your order, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-text-secondary transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-text-secondary transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* ─── Live Preview sidebar (rendered by parent in sticky panel) ─────── */}
      {/* Address preview data is passed via the form's watch() in the parent */}
    </form>
  )
}

