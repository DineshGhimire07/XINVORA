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
import { AdminSettingsService } from "@/services/admin/settings.service"
import { ContactForm } from "@/features/contact/ContactForm"

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the XINVORA team. Store coordinates, general support inquiries, and press contacts.",
})

export default async function ContactPage() {
  const contactSettings = await AdminSettingsService.getSetting("store_contact")

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
                    {contactSettings?.supportEmail && (
                      <p>
                        Support:{" "}
                        <a href={`mailto:${contactSettings.supportEmail}`} className="text-text-primary hover:text-accent transition-colors cursor-pointer">
                          {contactSettings.supportEmail}
                        </a>
                      </p>
                    )}
                    {contactSettings?.salesEmail && (
                      <p>
                        Sales:{" "}
                        <a href={`mailto:${contactSettings.salesEmail}`} className="text-text-primary hover:text-accent transition-colors cursor-pointer">
                          {contactSettings.salesEmail}
                        </a>
                      </p>
                    )}
                    {contactSettings?.returnsEmail && (
                      <p>
                        Returns:{" "}
                        <a href={`mailto:${contactSettings.returnsEmail}`} className="text-text-primary hover:text-accent transition-colors cursor-pointer">
                          {contactSettings.returnsEmail}
                        </a>
                      </p>
                    )}
                    {contactSettings?.phone && (
                      <p>Voice: <a href={`tel:${contactSettings.phone}`} className="text-text-primary hover:text-accent transition-colors">{contactSettings.phone}</a></p>
                    )}
                    {contactSettings?.whatsapp && (
                      <p>WhatsApp: <a href={`https://wa.me/${contactSettings.whatsapp.replace(/[^0-9]/g, '')}`} className="text-text-primary hover:text-accent transition-colors">{contactSettings.whatsapp}</a></p>
                    )}
                  </div>
                </Stack>

                {/* Studio Location */}
                <Stack gap={3}>
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Studio Coordinates
                  </h2>
                  <div className="text-body-sm text-text-secondary space-y-1">
                    <p className="text-text-primary font-medium">XINVORA</p>
                    <p>Kathmandu, Nepal</p>
                  </div>
                </Stack>

                {/* Studio Hours */}
                {contactSettings?.officeHours && (
                  <Stack gap={3}>
                    <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                      Availability
                    </h2>
                    <div className="text-body-sm text-text-secondary space-y-1">
                      <p>{contactSettings.officeHours}</p>
                    </div>
                  </Stack>
                )}

              </Stack>
            </div>

            {/* Right Column: Presentation Form (7/12) */}
            <div className="md:col-span-7 border border-border/60 bg-surface p-6 sm:p-8 rounded-sm text-left">
              <ContactForm />
            </div>

          </Grid>
        </Container>
      </Section>

    </main>
  )
}
