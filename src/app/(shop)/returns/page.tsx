/**
 * app/returns/page.tsx — XINVORA Returns, Exchanges & Refunds Policy Page
 *
 * Production-ready policy page.
 * Composes existing shared layout primitives and follows XINVORA's strict editorial design.
 * Uses the same sticky-left-nav + right-content column layout pattern as the FAQ page.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Returns & Refunds",
  description:
    "XINVORA returns, exchanges and refunds policy. Eligible products may be returned within 3–7 days of delivery, subject to verification.",
})

/* ── Section index for sticky left nav ───────────────────────────────────── */
const SECTIONS = [
  { id: "our-return-policy",       label: "Our Return Policy" },
  { id: "how-to-request-a-return", label: "How to Request a Return" },
  { id: "return-eligibility",      label: "Return Eligibility" },
  { id: "return-verification",     label: "Return Verification" },
  { id: "refunds",                 label: "Refunds" },
  { id: "damaged-or-incorrect",    label: "Damaged or Incorrect" },
  { id: "size-exchange",           label: "Size Exchange" },
  { id: "limited-products",        label: "Limited Products" },
  { id: "return-shipping",         label: "Return Shipping" },
  { id: "contact-xinvora",         label: "Contact XINVORA" },
]

/* ── Shared typography helpers ───────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
      {children}
    </h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-body-md font-bold font-display text-text-primary">
      {children}
    </h3>
  )
}

/* ── Return window callout ───────────────────────────────────────────────── */
function ReturnWindowCallout() {
  return (
    <div className="border border-border/60 bg-surface-secondary rounded-sm px-5 py-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase select-none">
        Return Window
      </span>
      <p className="text-display-sm font-display text-text-primary leading-tight tracking-tight">
        3–7 Days
      </p>
      <p className="text-body-xs text-text-secondary leading-relaxed">
        from the date of delivery, subject to return conditions and verification.
      </p>
    </div>
  )
}

/* ── Condition list ──────────────────────────────────────────────────────── */
function ConditionList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-body-sm text-text-secondary leading-relaxed">
          <span className="mt-[0.4em] shrink-0 w-[5px] h-[5px] rounded-full bg-accent/50" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

/* ── Numbered step list ──────────────────────────────────────────────────── */
function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3 pl-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-body-sm text-text-secondary leading-relaxed">
          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-[10px] font-bold text-accent select-none">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  )
}

/* ── Inline note ─────────────────────────────────────────────────────────── */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-xs text-text-tertiary border-l-2 border-accent/30 pl-3 leading-relaxed">
      {children}
    </p>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ReturnsPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">

      {/* ── Editorial Hero ── */}
      <Section id="returns-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Services
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Returns &amp; Refunds.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              At XINVORA, we want you to be satisfied with your purchase.
              Eligible products may be returned within{" "}
              <strong className="text-text-primary font-semibold">3–7 days</strong> after
              delivery, subject to the return conditions and verification process described below.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* ── Content ── */}
      <Section id="returns-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">

            {/* ── Sticky left nav (desktop only) ── */}
            <nav
              aria-label="Returns page sections"
              className="md:col-span-4 sticky top-32 flex-col items-start text-left hidden md:flex select-none"
            >
              <Stack gap={4}>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  Contents
                </span>
                <ul className="space-y-3 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Stack>
            </nav>

            {/* ── Right content column ── */}
            <div className="md:col-span-8 flex flex-col gap-14 text-left">

              {/* 01 — Our Return Policy */}
              <Stack
                id="our-return-policy"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>01 / Our Return Policy</SectionHeading>
                <ReturnWindowCallout />
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  A return request must be submitted to XINVORA before sending the product back.
                  Do not send a product back without first contacting XINVORA support.
                </p>
              </Stack>

              {/* 02 — How to Request a Return */}
              <Stack
                id="how-to-request-a-return"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>02 / How to Request a Return</SectionHeading>
                <StepList
                  items={[
                    "Contact XINVORA via support.xinvora@gmail.com or WhatsApp.",
                    "Provide your order number and explain the reason for the return.",
                    "Follow the return instructions provided by our support team.",
                    "Send the product back according to the instructions provided.",
                    "XINVORA will inspect and verify the returned product.",
                  ]}
                />
                <Note>
                  Do not send a product back without first contacting XINVORA support and
                  receiving return instructions.
                </Note>
              </Stack>

              {/* 03 — Return Eligibility */}
              <Stack
                id="return-eligibility"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>03 / Return Eligibility</SectionHeading>
                <Stack gap={3}>
                  <SubHeading>Eligible Condition</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    To be eligible for a return, the product must generally be:
                  </p>
                  <ConditionList
                    items={[
                      "Unused",
                      "Unworn",
                      "Unwashed",
                      "Undamaged",
                      "Unaltered",
                      "In its original condition",
                      "Returned with original tags and packaging where applicable",
                    ]}
                  />
                </Stack>

                <Stack gap={3}>
                  <SubHeading>Products That May Not Qualify</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    A return may be rejected if the product shows signs of:
                  </p>
                  <ConditionList
                    items={[
                      "Wearing or washing",
                      "Damage or alteration",
                      "Staining or misuse",
                      "Physical modification",
                      "Missing or damaged original tags where applicable",
                      "Any condition that makes the product unsuitable for resale",
                    ]}
                  />
                </Stack>

                <Note>
                  Final return eligibility is determined after XINVORA verifies the returned product.
                </Note>
              </Stack>

              {/* 04 — Return Verification */}
              <Stack
                id="return-verification"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>04 / Return Verification</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Returning a product does not automatically guarantee a refund. Once the returned
                  product reaches XINVORA, it will be inspected. The verification process may consider:
                </p>
                <ConditionList
                  items={[
                    "Product condition",
                    "Signs of use or wear",
                    "Damage, washing, or alteration",
                    "Original tags and packaging where applicable",
                    "Whether the return meets XINVORA's return requirements",
                  ]}
                />
                <Note>
                  Only eligible returns that pass verification will qualify for a refund or applicable exchange.
                </Note>
              </Stack>

              {/* 05 — Refunds */}
              <Stack
                id="refunds"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>05 / Refunds</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  If your return is approved after verification, the applicable refund will be processed
                  through the relevant payment or refund method.
                </p>
                <ConditionList
                  items={[
                    "The refund amount may depend on the approved return and applicable circumstances.",
                    "A refund will not be issued for products that fail the return verification requirements.",
                    "XINVORA will communicate the applicable refund decision after the returned product has been reviewed.",
                  ]}
                />
              </Stack>

              {/* 06 — Damaged or Incorrect */}
              <Stack
                id="damaged-or-incorrect"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>06 / Damaged or Incorrect Products</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  If you receive a product that is damaged, defective, incorrect, or different from the
                  product you ordered, contact XINVORA support as soon as possible.
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  After verification, XINVORA may provide either:
                </p>
                <ConditionList
                  items={[
                    "A replacement, subject to product availability.",
                    "A refund, where appropriate.",
                  ]}
                />
                <Note>
                  Please provide your order number and any requested photographs or other information that
                  may help us verify the issue.
                </Note>
              </Stack>

              {/* 07 — Size Exchange */}
              <Stack
                id="size-exchange"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>07 / Size Exchange</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Eligible size exchanges may be available depending on:
                </p>
                <ConditionList
                  items={[
                    "Product availability",
                    "Condition of the returned garment",
                    "Whether the product meets the return requirements",
                  ]}
                />
                <Note>
                  An exchange cannot be guaranteed if the requested size is unavailable.
                  Contact XINVORA support before sending a product back for an exchange.
                </Note>
              </Stack>

              {/* 08 — Limited Products */}
              <Stack
                id="limited-products"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>08 / Limited Products</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Products marked{" "}
                  <strong className="text-text-primary font-semibold">Limited</strong> are
                  released in very restricted quantities and are never restocked. A Limited product is
                  still subject to XINVORA&apos;s applicable return conditions.
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Because Limited products are never restocked, an exchange for another unit or size may
                  not be possible if the required product is unavailable. Where an eligible Limited
                  product cannot be exchanged due to unavailability, the applicable resolution will be
                  determined according to the return and verification process.
                </p>
              </Stack>

              {/* 09 — Return Shipping */}
              <Stack
                id="return-shipping"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>09 / Return Shipping</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Return shipping arrangements will be communicated by XINVORA support based on the
                  reason for the return and the circumstances of the order.
                </p>

                <Stack gap={3}>
                  <SubHeading>Before Returning a Product</SubHeading>
                  <ConditionList
                    items={[
                      "Contact XINVORA support.",
                      "Provide your order number.",
                      "Wait for return instructions.",
                      "Keep the product in its original condition — do not wash, wear, alter, or damage it.",
                      "Keep the original tags and packaging where applicable.",
                    ]}
                  />
                </Stack>

                <Note>
                  Do not send a return independently without first contacting XINVORA and
                  receiving instructions.
                </Note>
              </Stack>

              {/* 10 — Contact XINVORA */}
              <Stack
                id="contact-xinvora"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>10 / Contact XINVORA</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  For return, refund, exchange, damaged-product, or incorrect-order support.
                  Please include your order number whenever contacting support about an existing order.
                </p>

                {/* Contact cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="mailto:support.xinvora@gmail.com"
                    className="group border border-border/60 rounded-sm px-4 py-4 flex flex-col gap-1 hover:border-accent/50 transition-colors"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase select-none">
                      Email
                    </span>
                    <span className="text-body-xs text-text-primary group-hover:text-accent transition-colors break-all">
                      support.xinvora@gmail.com
                    </span>
                  </a>

                  <div className="border border-border/60 rounded-sm px-4 py-4 flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase select-none">
                      WhatsApp
                    </span>
                    <span className="text-body-xs text-text-primary">
                      XINVORA&apos;s official WhatsApp support channel
                    </span>
                  </div>
                </div>

                <Note>
                  XINVORA currently provides customer support through email and WhatsApp
                  rather than phone calls.
                </Note>
              </Stack>

            </div>
          </Grid>
        </Container>
      </Section>

    </main>
  )
}
