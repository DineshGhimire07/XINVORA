/**
 * app/contact/page.tsx — XINVORA Contact Utility Page
 *
 * Implements the editorial Contact page.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the XINVORA team. Store coordinates, general support inquiries, and press contacts.",
})

export default function ContactPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      
      {/* Editorial Hero */}
      <Section id="contact-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Inquiries
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Get in touch.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              Whether you have questions regarding our materials, custom adjustments, or private orders, we welcome your communication.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* Main Grid Content */}
      <Section id="contact-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">
            
            {/* Left Column: Coordinates (5/12) */}
            <div className="md:col-span-5 flex flex-col items-start text-left max-w-[28rem]">
              <Stack gap={10} className="w-full">
                
                {/* Correspondence */}
                <Stack gap={3}>
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Correspondence
                  </h2>
                  <div className="text-body-sm text-text-secondary space-y-2 select-all">
                    <p>
                      General Support:{" "}
                      <span className="text-text-primary hover:text-accent transition-colors cursor-pointer">
                        support@xinvora.com
                      </span>
                    </p>
                    <p>
                      Press & Brand:{" "}
                      <span className="text-text-primary hover:text-accent transition-colors cursor-pointer">
                        press@xinvora.com
                      </span>
                    </p>
                    <p>Voice: +45 33 11 00 22</p>
                  </div>
                </Stack>

                {/* Studio Location */}
                <Stack gap={3}>
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Studio Coordinates
                  </h2>
                  <div className="text-body-sm text-text-secondary space-y-1">
                    <p className="text-text-primary font-medium">XINVORA Copenhagen</p>
                    <p>Niels Hemmingsens Gade 6</p>
                    <p>1153 København K</p>
                    <p>Denmark</p>
                  </div>
                </Stack>

                {/* Studio Hours */}
                <Stack gap={3}>
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Availability
                  </h2>
                  <div className="text-body-sm text-text-secondary space-y-1">
                    <p>Monday – Friday: 09:00 – 17:00 CET</p>
                    <p>Saturday – Sunday: Closed</p>
                  </div>
                </Stack>

              </Stack>
            </div>

            {/* Right Column: Presentation Form (7/12) */}
            <div className="md:col-span-7 border border-border/60 bg-surface p-6 sm:p-8 rounded-sm text-left">
              <div className="space-y-6">
                <Stack gap={2}>
                  <h2 className="text-[11px] font-bold tracking-widest text-text-primary uppercase select-none">
                    Submit an Inquiry
                  </h2>
                  <p className="text-body-xs text-text-secondary">
                    Fields marked are simulated layouts. No live submission is performed.
                  </p>
                </Stack>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-[10px] font-bold text-text-secondary uppercase select-none">
                      Name
                    </label>
                    <input 
                      type="text" 
                      id="contact-name"
                      placeholder="Your name"
                      className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-[10px] font-bold text-text-secondary uppercase select-none">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      id="contact-email"
                      placeholder="Your email address"
                      className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-subject" className="text-[10px] font-bold text-text-secondary uppercase select-none">
                    Subject
                  </label>
                  <input 
                    type="text" 
                    id="contact-subject"
                    placeholder="Topic of inquiry"
                    className="w-full h-10 px-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors"
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-[10px] font-bold text-text-secondary uppercase select-none">
                    Message
                  </label>
                  <textarea 
                    id="contact-message"
                    rows={4}
                    placeholder="Describe your inquiry..."
                    className="w-full p-3 bg-background border border-border text-body-sm text-text-primary focus:outline-none focus:border-text-primary rounded-sm transition-colors resize-none"
                    disabled
                  />
                </div>

                <div>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full uppercase text-[11px] font-bold tracking-widest h-11"
                    disabled
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </div>

          </Grid>
        </Container>
      </Section>

    </main>
  )
}
