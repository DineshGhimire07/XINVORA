"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ChevronRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { NepalDeliverySchema, type NepalDeliveryFormValues } from "@/validations/checkout"
import { SearchableSelect } from "./SearchableSelect"
import { cn } from "@/lib/utils"

import type { NepalProvince, NepalDistrict, NepalMunicipality } from "@/db/queries/nepal"

// ─── Minimal Form Field ──────────────────────────────────────────────────────
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
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
          {label}
          {required && <span className="text-[#B89563] ml-0.5">*</span>}
        </label>
        {hint && !error && <span className="text-[11px] text-[#A69890]">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}
    </div>
  )
}

// ─── Input Styling ────────────────────────────────────────────────────────────
const inputClass = cn(
  "w-full h-[52px] px-4 rounded-lg border border-[#E8DED2] bg-white",
  "text-sm font-normal text-[#1A110F] placeholder:text-[#A69890] placeholder:font-light",
  "transition-all duration-200 outline-none",
  "hover:border-[#C8BBA6]",
  "focus:border-[#B89563] focus:ring-4 focus:ring-[#B89563]/12",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F2EFEA]"
)

// ─── Main Component ───────────────────────────────────────────────────────────
interface NepalDeliveryFormProps {
  provinces: NepalProvince[]
  savedAddress?: any
  allDistricts?: NepalDistrict[]
  initialDistricts?: NepalDistrict[]
  initialMunicipalities?: NepalMunicipality[]
  onSuccess?: (data: NepalDeliveryFormValues) => void
  initialData?: NepalDeliveryFormValues | null
}

export function NepalDeliveryForm({
  provinces,
  savedAddress,
  allDistricts = [],
  initialDistricts = [],
  initialMunicipalities = [],
  onSuccess,
  initialData,
}: NepalDeliveryFormProps) {
  const hasSavedAddress = Boolean(
    savedAddress?.fullName &&
    savedAddress?.phone &&
    savedAddress?.provinceId &&
    savedAddress?.districtId &&
    savedAddress?.municipalityId &&
    (savedAddress?.tole || savedAddress?.street)
  )

  const [showManualForm, setShowManualForm] = useState(!hasSavedAddress)
  const [showNote, setShowNote] = useState(Boolean(savedAddress?.deliveryNote || initialData?.deliveryNote))

  const [districts, setDistricts] = useState<NepalDistrict[]>(
    initialDistricts.length > 0
      ? initialDistricts
      : allDistricts.length > 0 && savedAddress?.provinceId
      ? allDistricts.filter((d) => d.provinceId === savedAddress.provinceId)
      : []
  )
  const [municipalities, setMunicipalities] = useState<NepalMunicipality[]>(initialMunicipalities)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Display names for preview / passing down
  const [provinceName, setProvinceName] = useState(savedAddress?.province?.name || savedAddress?.provinceName || "")
  const [districtName, setDistrictName] = useState(savedAddress?.district?.name || savedAddress?.districtName || "")
  const [municipalityName, setMunicipalityName] = useState(savedAddress?.municipality?.name || savedAddress?.municipalityName || "")

  const matchedMuni = initialMunicipalities.find((m) => m.id === savedAddress?.municipalityId)
  const [totalWards, setTotalWards] = useState(matchedMuni?.totalWards || savedAddress?.municipality?.totalWards || 9)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NepalDeliveryFormValues>({
    resolver: zodResolver(NepalDeliverySchema as any),
    defaultValues: {
      fullName: initialData?.fullName || savedAddress?.fullName || "",
      phone: initialData?.phone || savedAddress?.phone || "",
      provinceId: initialData?.provinceId || savedAddress?.provinceId || "",
      districtId: initialData?.districtId || savedAddress?.districtId || "",
      municipalityId: initialData?.municipalityId || savedAddress?.municipalityId || "",
      wardNumber: initialData?.wardNumber || savedAddress?.wardNumber || 1,
      tole: initialData?.tole || savedAddress?.tole || savedAddress?.street || "",
      street: initialData?.street || savedAddress?.street || "",
      landmark: initialData?.landmark || savedAddress?.landmark || "",
      deliveryNote: initialData?.deliveryNote || savedAddress?.deliveryNote || "",
      saveAddress: false,
      provinceName: initialData?.provinceName || savedAddress?.province?.name || savedAddress?.provinceName || "",
      districtName: initialData?.districtName || savedAddress?.district?.name || savedAddress?.districtName || "",
      municipalityName: initialData?.municipalityName || savedAddress?.municipality?.name || savedAddress?.municipalityName || "",
    },
  })

  const selectedProvinceId = watch("provinceId")
  const selectedDistrictId = watch("districtId")
  const selectedMunicipalityId = watch("municipalityId")

  const prevProvinceIdRef = React.useRef(savedAddress?.provinceId || "")
  const prevDistrictIdRef = React.useRef(savedAddress?.districtId || "")
  const prevMunicipalityIdRef = React.useRef(savedAddress?.municipalityId || "")

  // Auto-set default province (Bagmati Province) if none selected
  useEffect(() => {
    if (!selectedProvinceId && provinces.length > 0 && !savedAddress?.provinceId) {
      const defaultProvince = provinces.find((p) => p.name.includes("Bagmati")) || provinces[0]
      if (defaultProvince) {
        setValue("provinceId", defaultProvince.id)
        setValue("provinceName", defaultProvince.name)
        setProvinceName(defaultProvince.name)
        prevProvinceIdRef.current = defaultProvince.id
        if (allDistricts.length > 0) {
          setDistricts(allDistricts.filter((d) => d.provinceId === defaultProvince.id))
        }
      }
    }
  }, [selectedProvinceId, provinces, savedAddress, allDistricts, setValue])

  // Instant in-memory filter for districts when province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      if (prevProvinceIdRef.current !== "") {
        setDistricts([])
        setMunicipalities([])
        setValue("districtId", "")
        setValue("municipalityId", "")
        setValue("wardNumber", 1 as any)
        setDistrictName("")
        setMunicipalityName("")
        prevProvinceIdRef.current = ""
      }
      return
    }

    if (selectedProvinceId === prevProvinceIdRef.current && districts.length > 0) {
      return
    }

    const provinceChanged = selectedProvinceId !== prevProvinceIdRef.current
    prevProvinceIdRef.current = selectedProvinceId

    if (allDistricts.length > 0) {
      const matchedDistricts = allDistricts.filter((d) => d.provinceId === selectedProvinceId)
      setDistricts(matchedDistricts)
      if (provinceChanged) {
        setMunicipalities([])
        setValue("districtId", "")
        setValue("municipalityId", "")
        setValue("wardNumber", 1 as any)
        setDistrictName("")
        setMunicipalityName("")
      }
      return
    }

    setLoadingDistricts(true)
    fetch(`/api/nepal/districts?provinceId=${selectedProvinceId}`)
      .then((r) => r.json())
      .then((data) => {
        setDistricts(data)
        if (provinceChanged) {
          setMunicipalities([])
          setValue("districtId", "")
          setValue("municipalityId", "")
          setValue("wardNumber", 1 as any)
          setDistrictName("")
          setMunicipalityName("")
        }
      })
      .finally(() => setLoadingDistricts(false))
  }, [selectedProvinceId, allDistricts, districts.length, setValue])

  // Fetch municipalities when district changes
  useEffect(() => {
    if (!selectedDistrictId) {
      if (prevDistrictIdRef.current !== "") {
        setMunicipalities([])
        setValue("municipalityId", "")
        setValue("wardNumber", 1 as any)
        setMunicipalityName("")
        prevDistrictIdRef.current = ""
      }
      return
    }

    if (selectedDistrictId === prevDistrictIdRef.current && municipalities.length > 0) {
      return
    }

    const districtChanged = selectedDistrictId !== prevDistrictIdRef.current
    prevDistrictIdRef.current = selectedDistrictId

    setLoadingMunicipalities(true)
    fetch(`/api/nepal/municipalities?districtId=${selectedDistrictId}`)
      .then((r) => r.json())
      .then((data) => {
        setMunicipalities(data)
        if (districtChanged) {
          setValue("municipalityId", "")
          setValue("wardNumber", 1 as any)
          setMunicipalityName("")
        }
      })
      .finally(() => setLoadingMunicipalities(false))
  }, [selectedDistrictId, municipalities.length, setValue])

  // Update ward count when municipality changes
  useEffect(() => {
    if (!selectedMunicipalityId) return
    const muni = municipalities.find((m) => m.id === selectedMunicipalityId)
    if (muni) {
      setTotalWards(muni.totalWards || 9)
      const muniChanged = selectedMunicipalityId !== prevMunicipalityIdRef.current
      prevMunicipalityIdRef.current = selectedMunicipalityId

      if (muniChanged) {
        setValue("wardNumber", 1 as any)
      }
      setValue("municipalityName", muni.name)
      setValue("municipalityType", muni.type)
      setMunicipalityName(muni.name)
    }
  }, [selectedMunicipalityId, municipalities, setValue])

  const onSubmit = async (data: NepalDeliveryFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    if (onSuccess) {
      onSuccess({
        ...data,
        provinceName: data.provinceName || provinceName,
        districtName: data.districtName || districtName,
        municipalityName: data.municipalityName || municipalityName,
      })
      setIsSubmitting(false)
      return
    }
  }

  const handleUseSavedAddress = () => {
    if (!savedAddress || !onSuccess) return
    setIsSubmitting(true)
    onSuccess({
      fullName: savedAddress.fullName,
      phone: savedAddress.phone,
      provinceId: savedAddress.provinceId,
      districtId: savedAddress.districtId,
      municipalityId: savedAddress.municipalityId,
      wardNumber: Number(savedAddress.wardNumber) || 1,
      tole: savedAddress.tole || savedAddress.street || "Main Road",
      street: savedAddress.street || "",
      landmark: savedAddress.landmark || "",
      deliveryNote: savedAddress.deliveryNote || "",
      saveAddress: false,
      provinceName: savedAddress.province?.name || savedAddress.provinceName || "",
      districtName: savedAddress.district?.name || savedAddress.districtName || "",
      municipalityName: savedAddress.municipality?.name || savedAddress.municipalityName || "",
    })
    setIsSubmitting(false)
  }

  // Deliver to different address -> Reset every input to completely BLANK!
  const handleDeliverToDifferentAddress = () => {
    reset({
      fullName: "",
      phone: "",
      provinceId: "",
      districtId: "",
      municipalityId: "",
      wardNumber: 1,
      tole: "",
      street: "",
      landmark: "",
      deliveryNote: "",
      saveAddress: false,
      provinceName: "",
      districtName: "",
      municipalityName: "",
    })
    setProvinceName("")
    setDistrictName("")
    setMunicipalityName("")
    setDistricts([])
    setMunicipalities([])
    prevProvinceIdRef.current = ""
    prevDistrictIdRef.current = ""
    prevMunicipalityIdRef.current = ""
    setShowNote(false)
    setShowManualForm(true)
  }

  const handleEditSavedAddress = () => {
    // Open form keeping pre-filled saved values so user can fix a typo
    setShowManualForm(true)
  }

  const provinceOptions = provinces.map((p) => ({ id: p.id, label: p.name }))
  const districtOptions = districts.map((d) => ({ id: d.id, label: d.name }))
  const municipalityOptions = municipalities.map((m) => ({ id: m.id, label: m.name }))
  const wardOptions = Array.from({ length: totalWards }, (_, i) => ({
    id: String(i + 1),
    label: `Ward ${i + 1}`,
  }))

  return (
    <div className="space-y-6">
      {/* ─── OPTION 1: Saved Address Card (One-Tap Checkout) ────────────────── */}
      {hasSavedAddress && !showManualForm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F2EFEA]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1A110F] text-white flex items-center justify-center text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89563]">
                Saved Delivery Address
              </span>
            </div>
            <button
              type="button"
              onClick={handleEditSavedAddress}
              className="text-xs font-semibold text-[#1A110F] underline hover:text-[#B89563] transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h3 className="font-serif text-lg text-[#1A110F] font-normal">
                {savedAddress.fullName}
              </h3>
              <span className="text-xs text-[#8C7A72] font-mono">
                +977 {savedAddress.phone}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed pt-1">
              {[
                savedAddress.tole,
                savedAddress.street,
                savedAddress.wardNumber ? `Ward ${savedAddress.wardNumber}` : null,
                savedAddress.municipality?.name || savedAddress.municipalityName,
                savedAddress.district?.name || savedAddress.districtName,
                savedAddress.province?.name || savedAddress.provinceName,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseSavedAddress}
            disabled={isSubmitting}
            className="w-full h-[54px] rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 bg-[#1A110F] hover:bg-[#B89563] text-white flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Continue to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleDeliverToDifferentAddress}
              className="text-xs font-medium text-[#8C7A72] hover:text-[#1A110F] hover:underline transition-colors"
            >
              + Deliver to a different address
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── OPTION 2: Streamlined Minimal Delivery Form ─────────────────────── */}
      {showManualForm && (
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate className="space-y-5">
          {hasSavedAddress && (
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="inline-flex items-center gap-1.5 text-xs text-[#8C7A72] hover:text-[#1A110F] transition-colors pb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to saved address</span>
            </button>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.fullName?.message}>
              <input
                id="fullName"
                {...register("fullName")}
                placeholder="Receiver name"
                autoComplete="name"
                className={cn(inputClass, errors.fullName && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/10")}
              />
            </FormField>

            <FormField
              label="Phone Number"
              required
              error={errors.phone?.message}
              hint="98/97/96xxxxxxxx"
            >
              <div className="flex">
                <div className="flex items-center px-3 h-[52px] rounded-l-lg border border-r-0 border-[#E8DED2] bg-[#F5F0EB] text-xs text-[#8C7A72] font-semibold select-none">
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
                    errors.phone && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/10"
                  )}
                />
              </div>
            </FormField>
          </div>

          {/* Province & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder={selectedProvinceId ? "Select District" : "Choose Province first"}
                    disabled={!selectedProvinceId}
                    loading={loadingDistricts}
                    error={errors.districtId?.message}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Municipality & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Municipality" required error={errors.municipalityId?.message}>
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
                    placeholder={selectedDistrictId ? "Select Municipality" : "Choose District first"}
                    disabled={!selectedDistrictId}
                    loading={loadingMunicipalities}
                    error={errors.municipalityId?.message}
                  />
                )}
              />
            </FormField>

            <FormField label="Ward" required error={errors.wardNumber?.message}>
              <Controller
                name="wardNumber"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    id="ward-select"
                    options={wardOptions}
                    value={field.value ? String(field.value) : "1"}
                    onChange={(id) => field.onChange(parseInt(id))}
                    placeholder="Select Ward"
                    disabled={!selectedMunicipalityId}
                    error={errors.wardNumber?.message}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Street / Tole / Area (Single clean address line) */}
          <FormField label="Street Address / Area" required error={errors.tole?.message}>
            <input
              id="tole"
              {...register("tole")}
              placeholder="e.g. Lazimpat, House #12, near Radisson Hotel"
              className={cn(inputClass, errors.tole && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/10")}
            />
          </FormField>

          {/* Optional Delivery Instructions toggle */}
          <div className="pt-1">
            {!showNote ? (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="text-xs text-[#B89563] hover:underline transition-all"
              >
                + Add delivery instructions (optional)
              </button>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                    Delivery Instructions (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("deliveryNote", "")
                      setShowNote(false)
                    }}
                    className="text-[11px] text-[#A69890] hover:text-[#1A110F]"
                  >
                    Hide
                  </button>
                </div>
                <textarea
                  id="deliveryNote"
                  {...register("deliveryNote")}
                  rows={2}
                  placeholder="Ring bell · Call before arriving · Leave with reception"
                  className={cn(inputClass, "h-auto py-2.5 resize-none leading-relaxed")}
                />
              </div>
            )}
          </div>

          {/* Save Address Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                id="saveAddress"
                {...register("saveAddress")}
                className="w-4 h-4 rounded border-[#DDD0C6] text-[#1A110F] focus:ring-[#B89563]/20 cursor-pointer"
              />
              <span className="text-xs text-[#73645D] group-hover:text-[#1A110F] transition-colors">
                Save this address for future orders
              </span>
            </label>
          </div>

          {/* Server Error */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[54px] rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 bg-[#1A110F] hover:bg-[#B89563] active:scale-[0.99] text-white flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-[#A69890] pt-1">
            By proceeding, you agree to XINVORA&apos;s{" "}
            <Link href="/terms" className="underline hover:text-[#1A110F]">Terms</Link> &{" "}
            <Link href="/privacy" className="underline hover:text-[#1A110F]">Privacy</Link>
          </p>
        </form>
      )}
    </div>
  )
}
