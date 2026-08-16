"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

interface HeaderState {
  cart: {
    cartCount: number
    wishlistCount: number
    cartItems?: { productId: string; variantId: string; quantity: number }[]
  } | null
  wishlist: {
    items: { variant: { id: string } }[]
  } | null
  account: any | null
}

interface HeaderStateContextType {
  state: HeaderState
  wishlistIds: string[]
  cartItemMap: Map<string, number>
  isLoading: boolean
  refetch: () => Promise<void>
}

const HeaderStateContext = createContext<HeaderStateContextType | undefined>(undefined)

export function HeaderStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HeaderState>({
    cart: null,
    wishlist: null,
    account: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/commerce/header-state")
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } catch (error) {
      console.error("Failed to fetch header state:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchState()

    const handleUpdate = () => {
      fetchState()
    }

    window.addEventListener("cart-updated", handleUpdate)
    window.addEventListener("focus", handleUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleUpdate)
      window.removeEventListener("focus", handleUpdate)
    }
  }, [fetchState])

  const wishlistIds = useMemo(() => {
    return state.wishlist?.items?.map((item) => item.variant?.id).filter(Boolean) || []
  }, [state.wishlist])

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>()
    if (state.cart?.cartItems) {
      for (const item of state.cart.cartItems) {
        map.set(item.productId, (map.get(item.productId) || 0) + item.quantity)
        map.set(item.variantId, item.quantity)
      }
    }
    return map
  }, [state.cart])

  return (
    <HeaderStateContext.Provider value={{ state, wishlistIds, cartItemMap, isLoading, refetch: fetchState }}>
      {children}
    </HeaderStateContext.Provider>
  )
}

export function useHeaderState() {
  const context = useContext(HeaderStateContext)
  if (context === undefined) {
    throw new Error("useHeaderState must be used within a HeaderStateProvider")
  }
  return context
}
