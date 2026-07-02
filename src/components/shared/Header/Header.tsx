"use client"

import * as React from "react"
import Link from "next/link"
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from "lucide-react"
import { Container } from "@/components/shared/container"

/**
 * components/shared/Header/Header.tsx — XINVORA Main Header Navigation
 *
 * Implements the global navigation header.
 * Designed to feel transparent, premium, and perfectly aligned with the brand's visual identity.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="absolute top-0 left-0 w-full z-sticky bg-transparent border-b border-border/10">
      <Container className="h-16 md:h-20 flex items-center justify-between">
        
        {/* Left Side: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/shop" 
            className="group inline-flex items-center gap-1 text-[11px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors duration-200"
          >
            Shop
            <ChevronDown className="w-3 h-3 text-text-secondary group-hover:text-accent transition-colors duration-200" />
          </Link>
          <Link 
            href="/new-arrivals" 
            className="text-[11px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors duration-200"
          >
            New Arrivals
          </Link>
          <Link 
            href="/collections" 
            className="text-[11px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors duration-200"
          >
            Collections
          </Link>
          <Link 
            href="/journal" 
            className="text-[11px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors duration-200"
          >
            Journal
          </Link>
          <Link 
            href="/about" 
            className="text-[11px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors duration-200"
          >
            About
          </Link>
        </nav>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 text-text-primary hover:text-accent transition-colors duration-200"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Minimalist "X" Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link 
            href="/" 
            className="text-display-md font-display font-light text-text-primary select-none tracking-normal hover:opacity-85 transition-opacity"
            aria-label="XINVORA Home"
          >
            X
          </Link>
        </div>

        {/* Right Side: Utility Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            className="flex items-center justify-center p-2 text-text-primary hover:text-accent transition-colors duration-200"
            aria-label="Search items"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          
          <Link 
            href="/login" 
            className="flex items-center justify-center p-2 text-text-primary hover:text-accent transition-colors duration-200"
            aria-label="Your account"
          >
            <User className="w-4.5 h-4.5" />
          </Link>

          <Link 
            href="/cart" 
            className="flex items-center gap-1.5 p-2 text-text-primary hover:text-accent transition-colors duration-200"
            aria-label="Shopping bag with 0 items"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="text-[11px] font-semibold tracking-wider select-none">0</span>
          </Link>
        </div>

      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-modal bg-background flex flex-col md:hidden animate-fade-in">
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <span className="text-display-sm font-display text-text-primary">X</span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
            <Link 
              href="/shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[13px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors"
            >
              Shop
            </Link>
            <Link 
              href="/new-arrivals" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[13px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors"
            >
              New Arrivals
            </Link>
            <Link 
              href="/collections" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[13px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors"
            >
              Collections
            </Link>
            <Link 
              href="/journal" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[13px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors"
            >
              Journal
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[13px] font-semibold tracking-widest text-text-primary uppercase select-none hover:text-accent transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
