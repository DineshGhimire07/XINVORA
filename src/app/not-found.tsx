/**
 * app/not-found.tsx — XINVORA 404 Error Utility Page
 *
 * Implements the minimal, elegant 404 Page.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as React from "react"

export default function NotFoundPage() {
  return (
    <main className="flex-1 bg-background flex flex-col justify-center min-h-[70vh] pt-20">
      <Container>
        <Section id="not-found-block" padding="xl" className="bg-background">
          <Stack gap={8} align="center" className="text-center max-w-[28rem] mx-auto select-none">
            <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
              Error 404
            </span>
            <h1 className="text-display-md font-display text-text-primary leading-tight">
              Page not found.
            </h1>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              The coordinate you requested does not exist or has been relocated to another collection folder.
            </p>
            <div className="w-full pt-4">
              <Button asChild variant="outline" className="w-full uppercase text-[11px] font-bold tracking-widest h-11">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </Stack>
        </Section>
      </Container>
    </main>
  )
}
