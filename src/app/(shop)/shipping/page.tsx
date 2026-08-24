/**
 * app/(shop)/shipping/page.tsx — XINVORA Shipping Information Page
 *
 * Production-ready shipping information for Nepal-wide delivery.
 * Replaces the previous placeholder content with accurate shipping rules,
 * delivery estimates, order tracking guidance, and support details.
 *
 * Layout follows the editorial two-column pattern established in faq/page.tsx:
 *   - Sticky section index on the left (desktop only)
 *   - Main content column on the right
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Shipping Information",
  description:
    "XINVORA delivers across Nepal. Learn about shipping fees, delivery timelines, order tracking, and what to do if a delivery is missed.",
})

/* ── Section index — drives both the sticky nav and the content sections ── */
const SHIPPING_SECTIONS = [
  { id: "shipping-coverage",   label: "Delivery Coverage" },
  { id: "shipping-fee",        label: "Shipping Fee" },
  { id: "delivery-time",       label: "Estimated Delivery Time" },
  { id: "order-tracking",      label: "Order Tracking" },
  { id: "delivery-process",    label: "Delivery Process" },
  { id: "missed-delivery",     label: "Missed Delivery" },
  { id: "before-you-order",    label: "Before Placing Your Order" },
  { id: "shipping-support",    label: "Need Help?" },
]

export default function ShippingPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">

      {/* ── Editorial Hero ───────────────────────────────────────────────── */}
      <Section id="shipping-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Delivery
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Shipping Across Nepal.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              XINVORA delivers to locations throughout Nepal via our delivery
              partners. Below you will find everything you need to know about
              shipping fees, delivery timelines, and how to track your order.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* ── Two-column content layout ─────────────────────────────────────── */}
      <Section id="shipping-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">

            {/* ── Left: Sticky section index (desktop only) ─────────────── */}
            <div className="md:col-span-4 sticky top-32 flex-col items-start text-left hidden md:flex select-none">
              <Stack gap={4}>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  Sections
                </span>
                <ul className="space-y-3 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
                  {SHIPPING_SECTIONS.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {sec.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Stack>
            </div>

            {/* ── Right: Main content column ───────────────────────────── */}
            <div className="md:col-span-8 flex flex-col gap-14 text-left">

              {/* 01 / Delivery Coverage */}
              <Stack
                id="shipping-coverage"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  01 / Delivery Coverage
                </h2>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  XINVORA currently delivers to locations throughout Nepal
                  through our delivery partners. We are working to expand our
                  coverage over time.
                </p>
              </Stack>

              {/* 02 / Shipping Fee */}
              <Stack
                id="shipping-fee"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  02 / Shipping Fee
                </h2>

                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  Our shipping fee is based on the number of products in an
                  order.
                </p>

                {/* Rule summary */}
                <div className="space-y-1 text-body-sm text-text-secondary font-light">
                  <p>
                    <span className="font-semibold text-text-primary">
                      Up to 3 products —
                    </span>{" "}
                    NPR 150 total shipping.
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">
                      Each product after the first 3 —
                    </span>{" "}
                    an additional NPR 100 per product.
                  </p>
                </div>

                {/* Examples table */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase mb-3">
                    Examples
                  </p>
                  <div className="border border-border/50 divide-y divide-border/40 text-body-sm">
                    {[
                      { qty: "1 product",  fee: "NPR 150" },
                      { qty: "2 products", fee: "NPR 150" },
                      { qty: "3 products", fee: "NPR 150" },
                      { qty: "4 products", fee: "NPR 250" },
                      { qty: "5 products", fee: "NPR 350" },
                      { qty: "6 products", fee: "NPR 450" },
                    ].map(({ qty, fee }, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-text-secondary font-light">{qty}</span>
                        <span className="font-semibold text-text-primary tabular-nums">
                          {fee}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-tertiary leading-relaxed mt-3 text-pretty font-light">
                    The first 3 products are covered by the standard NPR 150
                    shipping fee. Starting with the 4th product, NPR 100 is
                    added for each additional product.
                  </p>
                </div>
              </Stack>

              {/* 03 / Estimated Delivery Time */}
              <Stack
                id="delivery-time"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  03 / Estimated Delivery Time
                </h2>

                {/* Delivery time rows */}
                <div className="border border-border/50 divide-y divide-border/40 text-body-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-text-secondary font-light">Kathmandu Valley</span>
                    <span className="font-semibold text-text-primary">Approx. 2–3 days</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-text-secondary font-light">Outside Kathmandu Valley</span>
                    <span className="font-semibold text-text-primary">Approx. 3–4 days</span>
                  </div>
                </div>

                <div className="space-y-2 text-body-sm text-text-secondary font-light text-pretty">
                  <p>
                    These are estimated delivery times and are not guaranteed
                    delivery dates. Delivery times may vary depending on:
                  </p>
                  <ul className="space-y-1 pl-4 list-disc marker:text-accent">
                    <li>Delivery location</li>
                    <li>Courier operations</li>
                    <li>Weather conditions</li>
                    <li>Public holidays</li>
                    <li>Transportation disruptions</li>
                    <li>Remote or difficult-to-reach locations</li>
                    <li>Other circumstances outside XINVORA&apos;s reasonable control</li>
                  </ul>
                </div>
              </Stack>

              {/* 04 / Order Tracking */}
              <Stack
                id="order-tracking"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  04 / Order Tracking
                </h2>
                <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  <p>
                    You can check your order status directly from the{" "}
                    <span className="font-semibold text-text-primary">Profile</span>{" "}
                    section of your XINVORA account. Once your order has been
                    dispatched, available shipment or delivery information will
                    be displayed there.
                  </p>
                  <p>
                    Keep your account information accessible so you can easily
                    monitor your order.
                  </p>
                </div>
              </Stack>

              {/* 05 / Delivery Process */}
              <Stack
                id="delivery-process"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  05 / Delivery Process
                </h2>
                <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  <p>
                    Once your order is confirmed and prepared, it will be handed
                    over to our delivery partner. The courier may contact you
                    using the phone number provided with your order.
                  </p>
                  <p>Please ensure that your:</p>
                  <ul className="space-y-1 pl-4 list-disc marker:text-accent">
                    <li>Delivery address is accurate and complete.</li>
                    <li>Phone number is correct and reachable.</li>
                    <li>Delivery details are provided clearly.</li>
                  </ul>
                  <p>
                    Incorrect or incomplete delivery information may cause
                    delays.
                  </p>
                </div>
              </Stack>

              {/* 06 / Missed Delivery */}
              <Stack
                id="missed-delivery"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  06 / If You Miss the Delivery
                </h2>
                <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  <p>
                    If you are unavailable when the courier attempts delivery,
                    another delivery attempt may be made. If the order still
                    cannot be delivered after the available attempts, the package
                    may be returned to the XINVORA warehouse.
                  </p>
                  <p>
                    If another delivery arrangement is requested after the
                    package has been returned, additional arrangements or charges
                    may apply depending on the circumstances.
                  </p>
                </div>
              </Stack>

              {/* 07 / Before Placing Your Order */}
              <Stack
                id="before-you-order"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  07 / Before Placing Your Order
                </h2>
                <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  <p>To help ensure a smooth delivery, please:</p>
                  <ul className="space-y-1 pl-4 list-disc marker:text-accent">
                    <li>Enter the correct delivery address.</li>
                    <li>Provide a valid and reachable phone number.</li>
                    <li>Check your product size using the available size guide.</li>
                    <li>Review your order details before confirming your purchase.</li>
                  </ul>
                  <p>
                    This helps prevent avoidable delivery delays and order
                    issues.
                  </p>
                </div>
              </Stack>

              {/* 08 / Need Help? */}
              <Stack
                id="shipping-support"
                gap={4}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                  08 / Need Help With Your Delivery?
                </h2>
                <div className="space-y-3 text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
                  <p>
                    If you have an issue with your delivery or order status,
                    contact XINVORA support. When reaching out, please include
                    your order number and relevant details so the team can assist
                    you efficiently.
                  </p>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold text-text-primary">Email</span>
                      <span className="mx-2 text-text-tertiary">—</span>
                      <a
                        href="mailto:support.xinvora@gmail.com"
                        className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
                      >
                        support.xinvora@gmail.com
                      </a>
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">WhatsApp</span>
                      <span className="mx-2 text-text-tertiary">—</span>
                      XINVORA&apos;s official WhatsApp support channel
                    </p>
                  </div>
                </div>
              </Stack>

            </div>
          </Grid>
        </Container>
      </Section>

    </main>
  )
}
