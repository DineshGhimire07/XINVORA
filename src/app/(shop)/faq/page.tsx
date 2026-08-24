/**
 * app/faq/page.tsx — XINVORA FAQ Utility Page
 *
 * Implements the editorial FAQ layout.
 * Composes existing shared layout primitives and follows a strict editorial design.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { FAQAccordion, type FAQGroup } from "@/components/shop/FAQAccordion"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Frequently Asked Questions. Information on orders, shipping throughout Nepal, returns, products, sizing, and customer support.",
})

const FAQ_DATA: FAQGroup[] = [
  {
    category: "Orders & Payment",
    items: [
      {
        q: "What payment methods does XINVORA accept?",
        a: "XINVORA accepts both Cash on Delivery (COD) and online payments.",
      },
      {
        q: "Can I place an order from anywhere in Nepal?",
        a: "Yes. XINVORA delivers across Nepal.",
      },
      {
        q: "Can I order multiple products in one order?",
        a: "Yes. You can purchase multiple products in a single order. The shipping charge remains NPR 150 per order, whether you purchase one product or multiple products.",
      },
      {
        q: "Can I check my order status?",
        a: "Yes. You can check your order status from the Profile section of your XINVORA account. Once an order is dispatched, available shipment or delivery information will be shown there.",
      },
      {
        q: "Can I cancel my order after placing it?",
        a: "Orders can only be cancelled before they enter the shipping/dispatch process. Once an order has been dispatched, cancellation may no longer be possible.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "How much does shipping cost?",
        a: "The standard shipping fee is NPR 150 per order. The charge remains NPR 150 whether the order contains one product or multiple products.",
      },
      {
        q: "How long does delivery take?",
        a: (
          <span className="flex flex-col gap-2">
            <span>Estimated delivery times are:</span>
            <span className="pl-3 border-l-2 border-accent/40 flex flex-col gap-1 text-text-primary/90">
              <span><strong>Kathmandu Valley:</strong> approximately 2–3 days</span>
              <span><strong>Outside Kathmandu:</strong> approximately 3–4 days</span>
            </span>
            <span className="text-text-secondary/90 text-[12.5px] mt-1">
              Delivery times are estimates and may vary due to courier conditions, weather, holidays, remote locations, or other circumstances beyond XINVORA&apos;s control.
            </span>
          </span>
        ),
      },
      {
        q: "Do you deliver outside Kathmandu?",
        a: "Yes. XINVORA delivers all over Nepal.",
      },
      {
        q: "How can I track my order?",
        a: "You can check your order status from the Profile section of your XINVORA account. Once your order is dispatched, available shipment or delivery information will be shown there.",
      },
    ],
  },
  {
    category: "Returns, Exchanges & Refunds",
    items: [
      {
        q: "Can I return a product?",
        a: "Yes. Returns are available for eligible orders, subject to XINVORA's return conditions and product verification.",
      },
      {
        q: "How does the return process work?",
        a: (
          <span>
            Contact XINVORA through{" "}
            <a
              href="mailto:support.xinvora@gmail.com"
              className="text-text-primary underline underline-offset-4 hover:text-accent transition-colors font-medium"
            >
              support.xinvora@gmail.com
            </a>{" "}
            or WhatsApp. Our team will review the request and guide you through the return process.
          </span>
        ),
      },
      {
        q: "Will I automatically receive a refund after returning an item?",
        a: "No. Refunds are processed after the returned garment has been verified by XINVORA. The condition of the garment and whether it meets the applicable return requirements will be considered before a refund is approved.",
      },
      {
        q: "What condition must the product be in for a return?",
        a: "Returned garments must generally be unused, unworn, undamaged, and returned with their original tags and packaging where applicable. Products showing signs of wear, damage, alteration, washing, or misuse may not qualify for a refund.",
      },
      {
        q: "What if I receive a damaged or incorrect product?",
        a: "Contact XINVORA as soon as possible. After verification, XINVORA may provide a replacement or refund depending on the situation and product availability.",
      },
      {
        q: "Can I exchange a product for another size?",
        a: "Eligible size exchanges may be possible depending on product availability and the condition of the returned garment. Contact XINVORA support before sending anything back.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    items: [
      {
        q: "How do I choose the right size?",
        a: "A size guide is available on the product page. We recommend checking the measurements before placing your order.",
      },
      {
        q: "Are XINVORA products manufactured by XINVORA?",
        a: "XINVORA is a curated fashion brand. We carefully select products and focus on quality, presentation, and the overall customer experience rather than manufacturing every garment ourselves.",
      },
      {
        q: "Will every product be restocked?",
        a: "Not necessarily. Some regular products may be restocked when available, while Limited products are permanently limited and will never be restocked.",
      },
    ],
  },
  {
    category: "Limited Collection",
    items: [
      {
        q: "What does \"Limited\" mean on XINVORA?",
        a: "A Limited product is intentionally released in very small quantities. Once the available pieces are sold, the product will not be restocked or reproduced as a regular XINVORA product.",
      },
      {
        q: "Why are Limited products not restocked?",
        a: "Limited releases are designed to remain genuinely scarce. They are available only in very limited quantities and are not intended to return once sold out.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "How can I contact XINVORA?",
        a: (
          <span className="flex flex-col gap-2">
            <span>For customer support, contact:</span>
            <span className="pl-3 border-l-2 border-accent/40 flex flex-col gap-1 text-text-primary/90">
              <span>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support.xinvora@gmail.com"
                  className="text-text-primary underline underline-offset-4 hover:text-accent transition-colors"
                >
                  support.xinvora@gmail.com
                </a>
              </span>
              <span>
                <strong>WhatsApp:</strong> XINVORA&apos;s official WhatsApp support channel
              </span>
            </span>
            <span className="text-text-secondary/90 text-[12.5px] mt-1">
              For support requests, customers should include their order number and a brief description of the issue whenever applicable.
            </span>
          </span>
        ),
      },
      {
        q: "Can I call XINVORA for support?",
        a: "XINVORA currently provides customer support through email and WhatsApp rather than phone calls.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      
      {/* Editorial Hero */}
      <Section id="faq-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[36rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Assistance
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Frequently Asked Questions.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              Essential references regarding our ordering processes, shipping throughout Nepal, return conditions, sizing, and customer assistance.
            </p>
          </Stack>
        </Container>
      </Section>

      {/* FAQ Accordion List Layout */}
      <Section id="faq-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">
            
            {/* Left Category Index Column (4/12 width) */}
            <div className="md:col-span-4 sticky top-32 flex-col items-start text-left hidden md:flex select-none">
              <Stack gap={4}>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  Categories
                </span>
                <nav aria-label="FAQ Categories">
                  <ul className="space-y-3 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
                    {FAQ_DATA.map((group) => {
                      const slug = group.category.toLowerCase().replace(/[^a-z0-9]/g, "-")
                      return (
                        <li key={group.category}>
                          <a 
                            href={`#${slug}`}
                            className="hover:text-text-primary transition-colors cursor-pointer block py-0.5"
                          >
                            {group.category}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </Stack>
            </div>

            {/* Right Q&A list Column (8/12 width) */}
            <div className="md:col-span-8 text-left">
              <FAQAccordion groups={FAQ_DATA} />
            </div>

          </Grid>
        </Container>
      </Section>

    </main>
  )
}

