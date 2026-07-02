/**
 * app/shipping/page.tsx — XINVORA Shipping Information Page
 *
 * Implements the editorial Shipping guidelines page.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Shipping Information",
  description: "XINVORA shipping policies, delivery transit times, handling speeds, and international customs guidelines.",
})

export default function ShippingPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Editorial Hero */}
        <Section id="shipping-hero" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Services
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Shipping & Delivery.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              We focus on carbon-neutral logistics to deliver our objects securely. Every shipment is carefully hand-inspected at our Copenhagen warehouse before dispatch.
            </p>
          </Stack>
        </Section>

        {/* Content Block */}
        <Section id="shipping-content" padding="lg" className="bg-background text-left">
          <div className="max-w-[36rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-10 text-pretty font-light">
            
            {/* Processing */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                01 / Handling & Processing
              </h2>
              <p>
                Standard instock objects are dispatched within 2 to 3 business days. For &ldquo;Made to Order&rdquo; items, please refer to the specific workshop production timelines displayed on the product card details (typically 2 to 4 weeks).
              </p>
            </Stack>

            {/* Domestic / EU Delivery */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                02 / European Union Delivery
              </h2>
              <p>
                We offer standard and express transit via certified road and air carriers. Standard transit takes 2 to 5 business days, while express courier shipments are typically completed in 1 to 2 business days. Shipping charges are calculated dynamically at checkout based on package weight.
              </p>
            </Stack>

            {/* International */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                03 / International Customs & Taxes
              </h2>
              <p>
                For orders delivered outside the European Union, local import customs fees, duties, and taxes may apply. These charges are established by the destination country&apos;s customs office and represent the responsibility of the recipient.
              </p>
            </Stack>

            {/* Signature Requirement */}
            <Stack gap={3}>
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
                04 / Security & Signatures
              </h2>
              <p>
                To secure the value of XINVORA objects during shipping, all parcels are dispatched requiring a physical signature upon delivery. We are unable to route packages to post office box addresses.
              </p>
            </Stack>

          </div>
        </Section>

      </Container>
    </main>
  )
}
