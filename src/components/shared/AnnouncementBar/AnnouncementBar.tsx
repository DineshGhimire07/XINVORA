import * as React from "react"

export function AnnouncementBar() {
  return (
    <div className="w-full bg-ink text-text-inverse/80 py-2.5 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between border-b border-text-inverse/5 z-sticky relative select-none">
      <div className="flex items-center gap-4 md:gap-6 text-[10px] font-medium tracking-[0.15em] uppercase text-text-inverse/60">
        <span>Complimentary shipping on orders over NPR 10,000</span>
        <span className="text-[6px] opacity-40">•</span>
        <span className="hidden sm:inline">New Summer Collection</span>
        <span className="hidden sm:inline text-[6px] opacity-40">•</span>
        <span className="hidden md:inline">Crafted for modern living</span>
        <span className="hidden md:inline text-[6px] opacity-40">•</span>
        <span className="hidden lg:inline">Worldwide delivery</span>
      </div>
      <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-text-inverse/60 hover:text-text-inverse cursor-pointer transition-colors">
        Nepal (NPR ₨) | EN <span className="text-[8px] ml-0.5 opacity-60">▼</span>
      </div>
    </div>
  )
}
