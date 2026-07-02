/**
 * app/terms/page.tsx — XINVORA Terms & Conditions Utility Page
 *
 * Implements the typography-first Terms page.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "XINVORA website terms of use, intellectual property copyrights, and purchase coordinates rules.",
})

export default function TermsPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Editorial Hero */}
        <Section id="terms-hero" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Legal
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Terms & Conditions.
            </h1>
            <p className="text-body-sm text-text-secondary leading-relaxed select-none">
              Last Updated: July 02, 2026
            </p>
          </Stack>
        </Section>

        {/* Content Block */}
        <Section id="terms-content" padding="lg" className="bg-background text-left">
          <div className="max-w-[36rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-8 text-pretty font-light">
            
            <p>
              Welcome to the XINVORA digital catalog. By browsing or purchasing from our platform, you agree to comply with the terms of use detailed below.
            </p>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                01 / Intellectual Property
              </h2>
              <p>
                All elements displayed on this website—including images, typography layouts, product names, text assets, and source code—remain the exclusive property of XINVORA and are protected by copyright laws.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                02 / Product & Price Coordinates
              </h2>
              <p>
                We inspect our product catalog for design accuracy. Minor textural variations in solid oak timber, natural flax fabrics, or wood-fired ceramics are organic traits, not defects. All pricing and details are subject to adjustment without warning.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                03 / Electronic Transactions
              </h2>
              <p>
                A purchase order represents a request. Contract validation occurs only when package dispatch is confirmed. We reserve the right to decline orders containing conflicting details or suspected fraud.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                04 / Liability Limitations
              </h2>
              <p>
                XINVORA coordinates services on an &ldquo;as is&rdquo; basis. We are not liable for direct, incidental, or secondary damages resulting from website downtime, delivery delays, or third-party logistics.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                05 / Governing Law
              </h2>
              <p>
                These terms are governed by the laws of Denmark, and any legal disputes will be evaluated by courts holding jurisdiction in Copenhagen.
              </p>
            </Stack>

          </div>
        </Section>

      </Container>
    </main>
  )
}
