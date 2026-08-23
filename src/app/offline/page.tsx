import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "You're Offline | XINVORA",
  description: "No internet connection. Please check your connection and try again.",
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 text-center select-none">
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-text-secondary mb-6 opacity-70">
        No Connection
      </p>
      <h1 className="font-display text-[2.8rem] sm:text-[3.5rem] font-light text-text-primary tracking-[0.12em] uppercase leading-none mb-4">
        You're Offline
      </h1>
      <p className="text-sm text-text-secondary font-sans font-light tracking-wide max-w-xs mb-10 leading-relaxed">
        It looks like you've lost your internet connection. Please check your connection and try again.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3 text-[11px] font-bold tracking-[0.3em] uppercase bg-text-primary text-background hover:bg-text-secondary transition-colors duration-300"
      >
        Try Again
      </Link>
    </div>
  )
}
