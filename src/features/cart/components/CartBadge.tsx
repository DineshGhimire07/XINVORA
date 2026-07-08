"use client"

import Link from "next/link"

interface CartBadgeProps {
  count: number
}

export function CartBadge({ count }: CartBadgeProps) {
  return (
    <Link href="/cart" className="relative p-2 text-text-primary hover:opacity-70 transition-opacity">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none text-white bg-black rounded-full min-w-[1.25rem]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
