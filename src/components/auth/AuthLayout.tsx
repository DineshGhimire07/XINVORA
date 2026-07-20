import React from "react"
import Link from "next/link"
import type { AuthPageSettings } from "@/types/settings"

interface AuthLayoutProps {
  children: React.ReactNode
  settings: AuthPageSettings
}

export function AuthLayout({ children, settings }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Dynamic Editorial Hero Image (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-900 overflow-hidden min-h-screen sticky top-0">
          <img
            src={settings.heroImageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"}
            alt="XINVORA Editorial"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          
          {/* Text Overlay */}
          <div className="absolute bottom-14 left-10 right-10 text-white space-y-4 animate-fade-in">
            <h2 className="font-serif text-3xl xl:text-4xl leading-tight font-light tracking-wide text-pretty drop-shadow-md">
              {settings.headline || "Luxury is found in the details."}
            </h2>
            <div className="w-10 h-[1.5px] bg-white/50" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-200/90 font-mono">
              {settings.subheading || "SPRING EDITORIAL 2026"}
            </p>
          </div>
        </div>

        {/* Right Side: Form Container (Optimized for Mobile & Desktop) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 min-h-screen bg-[#FBF9F5]">
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto my-auto space-y-6 sm:space-y-8">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8">
              <Link href="/" className="inline-block group">
                <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-[0.25em] sm:tracking-[0.35em] text-neutral-900 uppercase transition-opacity group-hover:opacity-80">
                  X I N V O R A
                </span>
              </Link>
            </div>

            {/* Main Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
