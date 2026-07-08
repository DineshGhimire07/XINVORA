"use client"

import { useState } from "react"
import { deleteInventoryAction } from "@/actions/admin/inventory.actions"
import { useRouter } from "next/navigation"

export function DeleteInventoryButton({ inventoryId, sku }: { inventoryId: string, sku: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete inventory stock tracking for SKU "${sku}"?`)
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      const res = await deleteInventoryAction(inventoryId)
      if (res.success) {
        router.refresh()
      } else {
        alert(`Error: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message || "Something went wrong"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[10px] uppercase tracking-wider underline hover:text-red-600 font-semibold text-red-500 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  )
}
