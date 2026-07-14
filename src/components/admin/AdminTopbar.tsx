"use client"

import { useEffect, useRef } from "react"
import { Menu, Search, Bell, ChevronDown } from "lucide-react"

interface AdminTopbarProps {
  user: {
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    role?: string | null
  }
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut listener to focus search input on Cmd+K/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Generate initials for the fallback avatar
  const getInitials = () => {
    const first = user.firstName?.[0] || ""
    const last = user.lastName?.[0] || ""
    if (first || last) {
      return (first + last).toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "A"
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.email || "Admin User"

  return (
    <header className="h-16 bg-admin-surface border-b border-admin-border flex items-center justify-between px-6 z-20 flex-shrink-0 select-none">
      {/* Left: Mobile hamburger menu & Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => {
            // Future mobile toggle action placeholder
            console.log("Toggle mobile sidebar")
          }}
          className="p-2 text-admin-text-secondary hover:bg-admin-content rounded-admin-md transition-colors md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anything..."
            className="w-full bg-admin-content border border-admin-border rounded-admin-md pl-10 pr-14 py-1.5 text-admin-sm text-admin-text-primary placeholder:text-admin-text-secondary focus:outline-none focus:border-admin-border-strong focus:ring-1 focus:ring-admin-border-strong transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium bg-admin-surface border border-admin-border text-admin-text-secondary rounded-admin-sm flex items-center gap-0.5 shadow-xs pointer-events-none">
            <span>⌘</span>
            <span>K</span>
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications and User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 text-admin-text-secondary hover:bg-admin-content rounded-admin-md transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-admin-status-danger-bg px-1 text-[9px] font-bold text-admin-status-danger-text border border-admin-surface">
            3
          </span>
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-admin-border" />

        {/* User Profile Summary Dropdown Trigger */}
        <button className="flex items-center gap-3 p-1.5 hover:bg-admin-content rounded-admin-md transition-colors group">
          {/* Avatar circle */}
          <div className="h-8 w-8 rounded-full bg-admin-primary flex items-center justify-center text-admin-primary-on text-admin-xs font-bold shadow-xs">
            {getInitials()}
          </div>

          {/* User Details */}
          <div className="text-left hidden sm:block">
            <p className="text-admin-sm font-semibold text-admin-text-primary leading-tight group-hover:text-admin-text-primary transition-colors">
              {displayName}
            </p>
            <p className="text-admin-xs text-admin-text-secondary leading-none mt-0.5">
              {user.role || "Admin"}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 text-admin-text-secondary group-hover:text-admin-text-primary transition-colors" />
        </button>
      </div>
    </header>
  )
}
