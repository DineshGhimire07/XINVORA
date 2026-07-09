"use client"

/**
 * ProductInstagramCard.tsx — XINVORA PDP Instagram Card
 * Conditionally rendered — hidden completely when no URL is provided.
 * Opens Instagram Reel in new tab. Functionality untouched — styling-only pass.
 */

interface ProductInstagramCardProps {
  instagramReelUrl?: string | null
}

export function ProductInstagramCard({ instagramReelUrl }: ProductInstagramCardProps) {
  // Render nothing when no URL — no gap, no placeholder, no empty card
  if (!instagramReelUrl || instagramReelUrl.trim() === "") return null

  return (
    <a
      href={instagramReelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex items-center justify-between gap-5
        w-full bg-white rounded-2xl px-6 py-5 mt-4 cursor-pointer
        transition-all duration-200 ease-[ease]
        hover:bg-[#FAFAF8]
        active:bg-[#F5F2EE]
      "
      style={{ border: "1px solid #F2EFEA" }}
      aria-label="See this product on Instagram"
    >
      {/* Left: Icon + Text */}
      <div className="flex items-start gap-4">
        {/* Instagram outline icon — same stroke-width and color rule as trust icons */}
        <div className="flex-shrink-0 mt-0.5 text-[#9A9087]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>

        {/* Text block */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#3A3530] select-none">
            Seen on Instagram
          </span>
          <p className="text-[12px] text-[#9A9087] leading-snug max-w-xs">
            See this product styled in motion by XINVORA.
          </p>
          <span className="text-[11px] text-[#9A9087]/70 font-medium mt-0.5 tracking-wide">
            @xinvora.official
          </span>
        </div>
      </div>

      {/* Right: Arrow icon — desktop hover: translateX(2px) */}
      <div className="flex-shrink-0 text-[#9A9087]/60 transition-transform duration-200 ease-[ease] md:group-hover:translate-x-[2px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </a>
  )
}
