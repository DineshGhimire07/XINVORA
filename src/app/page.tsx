/**
 * app/page.tsx — XINVORA Temporary Foundation Placeholder
 *
 * This is NOT the homepage.
 * The homepage will be built in the next prompt.
 *
 * This file exists only to:
 * - Prove the foundation builds without errors
 * - Render the Navbar + Footer from the layout
 * - Show the design tokens are working
 *
 * Replace this entire file in Prompt 3 when building the homepage.
 */

import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "Foundation",
  description: "XINVORA — Premium Lifestyle Brand",
  noIndex: true,
})

export default function FoundationPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      {/* Foundation verification — remove in Prompt 3 */}
      <div className="max-w-content-md space-y-8 text-center">
        {/* Overline */}
        <p className="text-overline text-accent">Foundation Ready</p>

        {/* Display heading — using our display font */}
        <h1 className="text-display-lg font-display text-text-primary text-balance">
          XINVORA
        </h1>

        {/* Body */}
        <p className="text-body-lg text-text-secondary max-w-prose mx-auto text-pretty">
          The production foundation is in place. Design system, navigation,
          animations, providers, and component architecture are all ready.
          The homepage begins in Prompt 3.
        </p>

        {/* Token verification strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {[
            { label: "Background", bg: "bg-background border border-border" },
            { label: "Surface", bg: "bg-surface border border-border" },
            { label: "Accent", bg: "bg-accent" },
            { label: "Ink", bg: "bg-ink" },
          ].map(({ label, bg }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`h-10 w-20 rounded-md ${bg}`} />
              <span className="text-caption text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
