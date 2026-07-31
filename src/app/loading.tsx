/**
 * app/loading.tsx — XINVORA Luxury Brand Loading State
 *
 * Designed to match XINVORA's high-end e-commerce aesthetic:
 * - Warm Ivory background tone (#F8F5F0)
 * - Refined display typography with spacious 0.35em letter tracking
 * - Smooth, hardware-accelerated dual gold/taupe orbiting ring spinner
 */

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading XINVORA..."
      className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-6 py-20 bg-[#F8F5F0]"
    >
      <div className="flex flex-col items-center gap-8 text-center animate-in fade-in-50 duration-500">
        
        {/* Luxury Circular Orbiting Spinner */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Subtle background ring */}
          <div className="absolute inset-0 rounded-full border border-[#E6DED3]" />
          
          {/* Spinning gold/taupe accent ring */}
          <div className="absolute inset-0 rounded-full border border-transparent border-t-[#A48B78] border-r-[#A48B78] animate-spin [animation-duration:1.4s]" />
          
          {/* Reverse counter-orbiting delicate inner ring */}
          <div className="absolute inset-2 rounded-full border border-transparent border-b-[#1A1A1A] border-l-[#1A1A1A] animate-spin [animation-duration:2.2s] [animation-direction:reverse] opacity-70" />

          {/* Centered luxury brand monogram initial */}
          <span className="font-display font-light text-sm tracking-widest text-[#1A1A1A] uppercase select-none">
            X
          </span>
        </div>

        {/* XINVORA Wordmark */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl md:text-2xl font-display font-light tracking-[0.35em] text-[#1A1A1A] uppercase pl-[0.35em]">
            XINVORA
          </h2>
          
          {/* Gold shimmer line divider */}
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#A48B78] to-transparent animate-pulse" />

          {/* Subtitle tag */}
          <p className="text-[9px] md:text-[10px] font-semibold tracking-[0.3em] text-[#A48B78] uppercase mt-1 pl-[0.3em]">
            Curating Excellence
          </p>
        </div>

      </div>
    </div>
  )
}
