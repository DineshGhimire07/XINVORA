/**
 * components/shared/Footer/Footer.tsx — XINVORA Global Footer
 *
 * Implements the global footer section of the website.
 * Composes navigation links, mock newsletter form, brand statement, and social links.
 */

import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FOOTER_NAV } from "@/constants/navigation"
import Link from "next/link"
import * as React from "react"

export function Footer() {
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
                XINVORA
              </Link>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Designed with intention. Made to endure. We create premium, quiet luxury apparel and furniture objects built for daily life.
              </p>
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
              <div className="flex flex-col gap-2 w-full">
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  size="sm"
                  className="h-9 px-3 bg-surface border border-border text-body-xs rounded-sm cursor-not-allowed focus:outline-none"
                  disabled 
                />
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-full uppercase text-[10px] font-bold tracking-widest h-9"
                  disabled
                >
                  Subscribe
                </Button>
              </div>
            </Stack>
          </div>

        </Grid>

        {/* Bottom Social & Copyright Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          
          {/* Copyright notice */}
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider select-none">
            &copy; 2026 XINVORA. Designed with intention.
          </p>

          {/* Social links */}
          <ul className="flex items-center gap-6 text-[11px] font-bold text-text-secondary uppercase tracking-widest select-none">
            <li>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-text-primary transition-colors duration-150"
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://pinterest.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-text-primary transition-colors duration-150"
              >
                Pinterest
              </a>
            </li>
            <li>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-text-primary transition-colors duration-150"
              >
                LinkedIn
              </a>
            </li>
          </ul>

        </div>

      </Container>
    </footer>
  )
}
