"use client"

import { useState } from "react"
import { createAddressAction, updateAddressAction, deleteAddressAction } from "@/actions/address.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"

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
      label: "",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "US",
      postalCode: "",
      phone: "",
      isDefaultShipping: false,
      isDefaultBilling: false,
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
      country: editingAddress.country || "US",
      postalCode: editingAddress.postalCode || "",
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
      // Reload page or update local state
      window.location.reload()
    } else {
      setError(result.error?.message || "Failed to save address details.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {isEditing && editingAddress ? (
        <Card className="rounded-none border-border-primary/40 shadow-sm">
          <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50">
            <CardTitle className="text-xs font-light tracking-widest uppercase">
              {editingAddress.id ? "Edit Address" : "Add New Address"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Address Label (e.g. Home, Work)</label>
                  <Input
                    value={editingAddress.label || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                    placeholder="Home"
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Phone Number</label>
                  <Input
                    value={editingAddress.phone || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">First Name</label>
                  <Input
                    value={editingAddress.firstName || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })}
                    required
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Last Name</label>
                  <Input
                    value={editingAddress.lastName || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })}
                    required
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Address Line 1</label>
                  <Input
                    value={editingAddress.line1 || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, line1: e.target.value })}
                    required
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Address Line 2 (Optional)</label>
                  <Input
                    value={editingAddress.line2 || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, line2: e.target.value })}
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">City</label>
                  <Input
                    value={editingAddress.city || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    required
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">State/Province</label>
                  <Input
                    value={editingAddress.state || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Postal Code</label>
                  <Input
                    value={editingAddress.postalCode || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, postalCode: e.target.value })}
                    required
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Country</label>
                <Input
                  value={editingAddress.country || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })}
                  placeholder="US"
                  maxLength={2}
                  required
                  className="rounded-none"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingAddress.isDefaultShipping}
                    onChange={(e) => setEditingAddress({ ...editingAddress, isDefaultShipping: e.target.checked })}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="text-body-sm text-text-secondary">Set as Default Shipping Address</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingAddress.isDefaultBilling}
                    onChange={(e) => setEditingAddress({ ...editingAddress, isDefaultBilling: e.target.checked })}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="text-body-sm text-text-secondary">Set as Default Billing Address</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-none uppercase tracking-widest text-[11px] font-semibold"
                >
                  {loading ? "Saving..." : "Save Address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-none uppercase tracking-widest text-[11px] font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Button
            onClick={handleAddNew}
            className="rounded-none px-6 py-3 uppercase tracking-widest text-[11px] font-semibold"
          >
            + Add New Address
          </Button>

          {addresses.length === 0 ? (
            <Card className="rounded-none border-dashed border-border-primary/60 text-center p-8 bg-surface-secondary/5">
              <p className="text-body-sm text-text-secondary">You have no saved addresses yet.</p>
            </Card>
          ) : (
            <Grid cols={{ base: 1, md: 2 }} gap={6}>
              {addresses.map((a) => (
                <Card key={a.id} className="rounded-none border-border-primary/40 shadow-xs">
                  <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/20 flex flex-row items-center justify-between py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{a.label || "Saved Address"}</span>
                    <div className="flex gap-1.5">
                      {a.isDefaultShipping && <span className="text-[8px] bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 tracking-wider uppercase font-semibold">Shipping</span>}
                      {a.isDefaultBilling && <span className="text-[8px] bg-surface-secondary border border-border text-text-secondary px-1.5 py-0.5 tracking-wider uppercase font-semibold">Billing</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="text-body-sm text-text-secondary space-y-0.5">
                      <p className="text-text-primary font-medium">{a.firstName} {a.lastName}</p>
                      <p>{a.line1}</p>
                      {a.line2 && <p>{a.line2}</p>}
                      <p>{a.city}, {a.state} {a.postalCode}</p>
                      <p>{a.country}</p>
                      {a.phone && <p className="font-mono pt-1 text-[11px]">Tel: {a.phone}</p>}
                    </div>
                    <div className="flex gap-4 border-t border-border/40 pt-4">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-body-xs uppercase tracking-wider underline hover:text-accent font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-body-xs uppercase tracking-wider underline text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          )}
        </div>
      )}
    </div>
  )
}
