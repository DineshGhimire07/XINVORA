/**
 * app/search/page.tsx — XINVORA Search Page Mockup
 *
 * Implements the presentation-only Search interface.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Search",
  description: "Search the XINVORA catalogue and editorial journal stories.",
})

export default function SearchPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Search Input Area */}
        <Section id="search-bar" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Explore
            </span>
            <h1 className="text-display-md font-display text-text-primary leading-tight tracking-tight">
              Search XINVORA.
            </h1>
            
            {/* Simulated Search Input */}
            <div className="relative w-full select-none">
              <input 
                type="text" 
                placeholder="Enter search terms..."
                className="w-full h-12 px-4 bg-surface border border-border text-body-sm text-text-primary rounded-sm transition-colors cursor-not-allowed focus:outline-none"
                disabled
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-body-xs font-semibold uppercase">
                Search
              </span>
            </div>
          </Stack>
        </Section>

        {/* Empty State Block */}
        <Section id="search-results" padding="md" className="bg-background text-left">
          <div className="max-w-[40rem] mx-auto border-t border-border/40 pt-10">
            <Stack gap={8}>
              
              {/* Notice */}
              <Stack gap={2}>
                <p className="text-body-md font-bold text-text-primary uppercase tracking-wide select-none">
                  No results found.
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  We couldn&apos;t find any objects or publications matching your query. Review your spelling or try exploring our primary collections.
                </p>
              </Stack>

              {/* Suggestions */}
              <Stack gap={3}>
                <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                  Suggested Coordinates
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm text-text-secondary">
                  <li>
                    <Link href="/products/linen-draped-coat" className="hover:text-text-primary transition-colors">
                      &bull; Linen Draped Coat
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/stoneware-vessel" className="hover:text-text-primary transition-colors">
                      &bull; Stoneware Vessel
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/oak-lounge-chair" className="hover:text-text-primary transition-colors">
                      &bull; Oak Lounge Chair
                    </Link>
                  </li>
                  <li>
                    <Link href="/collections" className="hover:text-text-primary transition-colors">
                      &bull; All Collections
                    </Link>
                  </li>
                </ul>
              </Stack>

            </Stack>
          </div>
        </Section>

      </Container>
    </main>
  )
}
