/**
 * app/privacy/page.tsx — XINVORA Privacy Policy Utility Page
 *
 * Implements the typography-first Privacy Policy layout.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "XINVORA customer data processing guidelines, privacy rights, and cookies policy details.",
})

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Editorial Hero */}
        <Section id="privacy-hero" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Legal
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Privacy Policy.
            </h1>
            <p className="text-body-sm text-text-secondary leading-relaxed select-none">
              Last Updated: July 02, 2026
            </p>
          </Stack>
        </Section>

        {/* Content Block */}
        <Section id="privacy-content" padding="lg" className="bg-background text-left">
          <div className="max-w-[36rem] mx-auto text-text-secondary text-body-md leading-relaxed space-y-8 text-pretty font-light">
            
            <p>
              Your privacy is of critical importance to XINVORA. This document outlines the protocols we follow when curating, processing, and protecting your personal details.
            </p>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                01 / Information Collection
              </h2>
              <p>
                We collect personal information necessary to execute transactions and manage communications. This includes your correspondence address, telephone numbers, and email details collected during catalog registration.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                02 / Data Usage
              </h2>
              <p>
                All data is utilized to complete shipping logistics, inspect payment verifications, and deliver occasional design bulletins. We do not sell or lease customer database entries to third-party marketing companies.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                03 / Third-Party Partners
              </h2>
              <p>
                To provide premium commerce services, we transmit necessary data elements to transaction gateways and shipping couriers. These organizations process your information according to our security protocols.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                04 / Cookies & Analytics
              </h2>
              <p>
                Our digital platform uses subtle browser cookies to remember shopping configurations. This tracks session metrics without personal identification, ensuring smooth navigation performance.
              </p>
            </Stack>

            <Stack gap={2}>
              <h2 className="text-body-md font-bold font-display text-text-primary uppercase tracking-wider">
                05 / Legal Rights
              </h2>
              <p>
                You retain the absolute right to inspect, correct, or request the deletion of your personal details stored in our database. Contact our studio correspondence coordinates to initiate these actions.
              </p>
            </Stack>

          </div>
        </Section>

      </Container>
    </main>
  )
}
