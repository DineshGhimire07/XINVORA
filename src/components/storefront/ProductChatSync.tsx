"use client"

import { useEffect } from "react"

interface ProductChatSyncProps {
  id: string
  name: string
  slug: string
}

export function ProductChatSync({ id, name, slug }: ProductChatSyncProps) {
  useEffect(() => {
    const detail = { id, name, slug }
    if (typeof window !== "undefined") {
      ;(window as unknown as { __XINVORA_PRODUCT__?: { id: string; name: string; slug: string } | null }).__XINVORA_PRODUCT__ = detail
      window.dispatchEvent(new CustomEvent("xinvora:product-view", { detail }))
    }

    return () => {
      if (typeof window !== "undefined") {
        const win = window as unknown as { __XINVORA_PRODUCT__?: { id: string; name: string; slug: string } | null }
        if (win.__XINVORA_PRODUCT__?.id === id) {
          win.__XINVORA_PRODUCT__ = null
          window.dispatchEvent(new CustomEvent("xinvora:product-view", { detail: null }))
        }
      }
    }
  }, [id, name, slug])

  return null
}
