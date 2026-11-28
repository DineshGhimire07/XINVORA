"use client"

import { useState } from "react"
import { createAddressAction, updateAddressAction, deleteAddressAction } from "@/actions/address.actions"
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  country: string
  postalCode: string
  phone: string | null
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

interface AddressesListProps {
  initialAddresses: Address[]
}

export function AddressesList({ initialAddresses }: AddressesListProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setEditingAddress({
      label: "Home",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "NP",
      postalCode: "44600",
      phone: "",
      isDefaultShipping: addresses.length === 0,
      isDefaultBilling: addresses.length === 0,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return
    setLoading(true)
    setError(null)

    const result = await deleteAddressAction(id)
    if (result.success) {
      setAddresses(addresses.filter((a) => a.id !== id))
    } else {
      setError(result.error?.message || "Failed to delete address.")
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAddress) return
    setLoading(true)
    setError(null)

    const payload = {
      label: editingAddress.label || undefined,
      firstName: editingAddress.firstName || "",
      lastName: editingAddress.lastName || "",
      line1: editingAddress.line1 || "",
      line2: editingAddress.line2 || undefined,
      city: editingAddress.city || "",
      state: editingAddress.state || undefined,
      country: editingAddress.country || "NP",
      postalCode: editingAddress.postalCode || "44600",
      phone: editingAddress.phone || undefined,
      isDefaultShipping: !!editingAddress.isDefaultShipping,
      isDefaultBilling: !!editingAddress.isDefaultBilling,
    }

    let result
    if (editingAddress.id) {
      result = await updateAddressAction(editingAddress.id, payload)
    } else {
      result = await createAddressAction(payload)
    }

    if (result.success) {
      window.location.reload()
    } else {
      setError(result.error?.message || "Failed to save address details.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEditing && editingAddress ? (
        <div className="bg-white rounded-2xl border border-[#EDE3DB] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="pb-4 border-b border-[#F2EFEA] mb-5">
            <h2 className="text-xs font-bold tracking-[0.15em] text-[#1A110F] uppercase">
              {editingAddress.id ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  Address Label (e.g. Home, Office)
                </label>
                <input
                  value={editingAddress.label || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                  placeholder="Home"
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  Contact Phone Number *
                </label>
                <input
                  value={editingAddress.phone || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  required
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  First Name *
                </label>
                <input
                  value={editingAddress.firstName || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })}
                  required
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  Last Name *
                </label>
                <input
                  value={editingAddress.lastName || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })}
                  required
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  Street Address / Tole / Landmark *
                </label>
                <input
                  value={editingAddress.line1 || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, line1: e.target.value })}
                  placeholder="e.g. New Baneshwor, Near Chowk"
                  required
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  Municipality / City *
                </label>
                <input
                  value={editingAddress.city || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  placeholder="e.g. Kathmandu"
                  required
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#73645D]">
                  District / Province
                </label>
                <input
                  value={editingAddress.state || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                  placeholder="e.g. Bagmati Province"
                  className="w-full h-11 px-4 bg-[#FAF6F2] border border-[#EDE3DB] rounded-xl text-xs text-[#1A110F] focus:outline-none focus:border-[#B89563] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F2EFEA] space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#73645D]">
                <input
                  type="checkbox"
                  checked={!!editingAddress.isDefaultShipping}
                  onChange={(e) => setEditingAddress({ ...editingAddress, isDefaultShipping: e.target.checked })}
                  className="accent-[#1A110F] w-4 h-4 rounded cursor-pointer"
                />
                <span>Set as default shipping address</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 h-11 bg-[#1A110F] hover:bg-[#33221E] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Saving..." : "Save Address"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 h-11 border border-[#EDE3DB] hover:bg-[#FAF6F2] text-[#1A110F] rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddNew}
              className="px-5 h-11 bg-[#1A110F] hover:bg-[#33221E] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E6D5C3]" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#EDE3DB] p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF6F2] border border-[#EDE3DB] flex items-center justify-center text-[#B89563] mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-[#1A110F]">No saved addresses</p>
              <p className="text-xs text-[#8C7A72] mt-1">
                You haven't saved any addresses yet. Add an address for rapid checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-[#EDE3DB] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#F2EFEA] mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#B89563]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1A110F]">
                          {a.label || "Saved Address"}
                        </span>
                      </div>
                      {a.isDefaultShipping && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FAF6F2] border border-[#EDE3DB] text-[#B89563] px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-[#73645D] leading-relaxed">
                      <p className="font-semibold text-[#1A110F]">
                        {a.firstName} {a.lastName}
                      </p>
                      <p>{a.line1}</p>
                      {a.line2 && <p>{a.line2}</p>}
                      <p>
                        {[a.city, a.state].filter(Boolean).join(", ")}
                      </p>
                      {a.phone && (
                        <p className="pt-1 text-[#8C7A72]">
                          Phone: {a.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F2EFEA] mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(a)}
                      className="px-3 py-1.5 rounded-lg border border-[#EDE3DB] text-xs font-medium text-[#1A110F] hover:bg-[#FAF6F2] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3 text-[#8C7A72]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
