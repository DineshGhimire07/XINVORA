"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

interface HeaderState {
  cart: {
    cartCount: number
    wishlistCount: number
  } | null
  wishlist: {
    items: { variant: { id: string } }[]
  } | null
  account: any | null
}

interface HeaderStateContextType {
  state: HeaderState
  wishlistIds: string[]
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

  return (
    <HeaderStateContext.Provider value={{ state, wishlistIds, isLoading, refetch: fetchState }}>
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
