"use client"

import { useState } from "react"
import { hardDeleteProductAction } from "@/actions/admin/products.actions"
import { useRouter } from "next/navigation"

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${productName}"? This will delete all variants, pricing, and stock history from the system.`
    )
    
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      const res = await hardDeleteProductAction(productId)
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
      className="text-[10px] uppercase tracking-wider underline hover:text-red-600 font-semibold text-red-500 disabled:opacity-50 ml-4 transition-colors"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  )
}
