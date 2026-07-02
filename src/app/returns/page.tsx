/**
 * app/returns/page.tsx — XINVORA Returns & Exchanges Policy Page
 *
 * Implements the returns & exchanges instructions.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Returns & Exchanges",
  description: "XINVORA returns guidelines, credit terms, product exclusions, and hand-inspection protocols.",
})

export default function ReturnsPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Editorial Hero */}
        <Section id="returns-hero" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Services
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Returns & Exchanges.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              If an object does not align with your expectations, we offer returns for refund or store credit within 14 days of delivery.
            </p>
          </Stack>
        </Section>

        {/* Content Block */}
        <Section id="returns-content" padding="lg" className="bg-background text-left">
          <div className="max-w-[36rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-10 text-pretty font-light">
            
            {/* Guidelines */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                01 / Policy Conditions
              </h2>
              <p>
                To qualify for a refund, returned garments must be unworn, unwashed, and retain all original tag attachments. Homeware items must be returned unused in their original box packaging.
              </p>
            </Stack>

            {/* Steps */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                02 / Return Process
              </h2>
              <ol className="space-y-4 list-decimal pl-4">
                <li>
                  <span className="font-bold text-text-primary">Initiate Request:</span> Write to our support email detailing your order index and return motivation.
                </li>
                <li>
                  <span className="font-bold text-text-primary">Packaging:</span> Wrap the item in its original box container to protect the materials during transit.
                </li>
                <li>
                  <span className="font-bold text-text-primary">Dispatch:</span> Affix the return label and drop the parcel at a certified carrier coordinates.
                </li>
              </ol>
            </Stack>

            {/* Inspections */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                03 / Inspection & Credit
              </h2>
              <p>
                Every return undergoes a rigorous quality check at our studio. Once verified, refunds are issued to the original payment method within 7 to 10 business days, minus standard shipping and restocking coordinates.
              </p>
            </Stack>

            {/* Exclusions */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                04 / Custom Exclusions
              </h2>
              <p>
                Custom-altered items, personalized accessories, and large furniture objects built specifically as &ldquo;Made to Order&rdquo; are excluded from standard returns and exchanges due to their bespoke production nature.
              </p>
            </Stack>

          </div>
        </Section>

      </Container>
    </main>
  )
}
