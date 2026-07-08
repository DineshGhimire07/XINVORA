/**
 * components/shared/Footer/Footer.tsx — XINVORA Global Footer
 *
 * Implements the global footer section of the website.
 * Composes navigation links, mock newsletter form, brand statement, and social links.
 */

import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { FOOTER_NAV } from "@/constants/navigation"
import Link from "next/link"
import * as React from "react"
import { NewsletterForm } from "@/features/newsletter/components/NewsletterForm"
import { AdminSettingsService } from "@/services/admin/settings.service"

export async function Footer() {
  const generalSettings = await AdminSettingsService.getSetting("general")
  const contactSettings = await AdminSettingsService.getSetting("store_contact")
  
  const storeName = generalSettings?.storeName || "XINVORA"
  const tagline = generalSettings?.storeTagline || "Designed with intention. Made to endure. We create premium, quiet luxury apparel and furniture objects built for daily life."
  const socialLinks = contactSettings?.socialLinks

  return (
    <footer className="border-t border-border/60 bg-background pt-16 pb-12 select-none" role="contentinfo">
      <Container>
        
        {/* Main Footer Links & Newsletter Grid */}
        <Grid cols={{ base: 1, md: 12 }} gap={12} className="pb-12 border-b border-border/40">
          
          {/* Brand Info Left Section (4/12 width) */}
          <div className="md:col-span-4 flex flex-col items-start text-left max-w-[20rem]">
            <Stack gap={4}>
              <Link 
                href="/" 
                className="text-heading-lg font-display text-text-primary tracking-widest uppercase hover:opacity-85 transition-opacity"
              >
                {storeName}
              </Link>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                {tagline}
              </p>
              {contactSettings?.supportEmail && (
                <a href={`mailto:${contactSettings.supportEmail}`} className="text-sm font-semibold text-text-primary hover:underline">
                  {contactSettings.supportEmail}
                </a>
              )}
              {contactSettings?.phone && (
                <a href={`tel:${contactSettings.phone}`} className="text-sm font-semibold text-text-secondary hover:text-text-primary">
                  {contactSettings.phone}
                </a>
              )}
            </Stack>
          </div>

          {/* Navigation Links Mid Section (5/12 width) */}
          <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {FOOTER_NAV.map((group) => (
              <Stack key={group.id} gap={4}>
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-primary uppercase">
                  {group.heading}
                </h3>
                <ul className="space-y-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={item.href} 
                        className="hover:text-text-primary transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            ))}
          </div>

          {/* Newsletter Presentation Right Section (3/12 width) */}
          <div className="md:col-span-3 flex flex-col items-start text-left max-w-[18rem]">
            <Stack gap={4} className="w-full">
              <div className="flex flex-col gap-1">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-primary uppercase">
                  Newsletter
                </h3>
                <p className="text-body-xs text-text-secondary leading-relaxed">
                  Sign up for private releases, design insights, and seasonal catalogues.
                </p>
              </div>
              
              {/* Presentation Form fields */}
              <NewsletterForm layout="inline" placeholder="Email Address" />
            </Stack>
          </div>

        </Grid>

        {/* Bottom Social & Copyright Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          
          {/* Copyright notice */}
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider select-none">
            &copy; {new Date().getFullYear()} {storeName}.
          </p>

          {/* Social links */}
          <ul className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-text-secondary uppercase tracking-widest select-none">
            {socialLinks?.instagram && (
              <li>
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Instagram
                </a>
              </li>
            )}
            {socialLinks?.facebook && (
              <li>
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Facebook
                </a>
              </li>
            )}
            {socialLinks?.youtube && (
              <li>
                <a 
                  href={socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  YouTube
                </a>
              </li>
            )}
            {socialLinks?.linkedin && (
              <li>
                <a 
                  href={socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  LinkedIn
                </a>
              </li>
            )}
            {socialLinks?.tiktok && (
              <li>
                <a 
                  href={socialLinks.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  TikTok
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
