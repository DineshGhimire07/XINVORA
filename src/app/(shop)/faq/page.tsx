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
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Frequently Asked Questions. Information on orders, shipping, returns, product variants, and linen/furniture care.",
})

interface FAQGroup {
  category: string
  items: {
    q: string
    a: string
  }[]
}

const FAQ_DATA: FAQGroup[] = [
  {
    category: "Orders & Production",
    items: [
      {
        q: "What does 'Made to Order' mean?",
        a: "To eliminate waste and maintain exceptional quality control, certain garments and furniture editions are constructed only after an order is confirmed. Production times vary between 2 to 4 weeks depending on the workshop.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "As production begins shortly after verification, modifications must be requested within 24 hours of placement by writing to our support correspondence.",
      },
      {
        q: "Are the editions restocked?",
        a: "We produce in controlled, limited runs. Once an edition is marked as sold out, it is rarely restocked in the exact same textile configuration, as we source deadstock or small-batch organic fabrics.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "Where do you ship from?",
        a: "All objects are packaged and shipped from our studio warehouse in Copenhagen, Denmark.",
      },
      {
        q: "Do you offer international shipping?",
        a: "Yes, we ship globally via carbon-neutral express carriers. Transit times range from 3 to 7 business days depending on the region.",
      },
      {
        q: "How can I track my shipment?",
        a: "Once your package is hand-inspected and dispatched, a tracking confirmation link will be delivered via email.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns of unworn, unwashed garments and unused furniture pieces in their original packaging within 14 days of delivery. Returns are subject to a return shipping and restocking fee.",
      },
      {
        q: "How do I initiate a return?",
        a: "To request a return, contact our support team. Detailed documentation is provided on our Returns page.",
      },
    ],
  },
  {
    category: "Care Guidelines",
    items: [
      {
        q: "How do I care for Belgian Linen?",
        a: "Wash on a gentle cycle in cool water with a mild pH-neutral detergent. Line dry out of direct sunlight. Wrinkling is a natural characteristic of flax fibers and represents its design character; avoid high-heat ironing.",
      },
      {
        q: "How do I care for FSC Oak furniture?",
        a: "Dust weekly with a dry lint-free cloth. Wipe spills immediately. Avoid placing solid timber near direct heating vents or radiators. Re-apply a matte timber oil once a year to protect the timber surface.",
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
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Assistance
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Frequently Asked Questions.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              Essential references regarding our sourcing processes, order shipping parameters, returns instructions, and raw material care guides.
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
                <ul className="space-y-3 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
                  {FAQ_DATA.map((group) => (
                    <li key={group.category}>
                      <a 
                        href={`#${group.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        className="hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {group.category}
                      </a>
                    </li>
                  ))}
                </ul>
              </Stack>
            </div>

            {/* Right Q&A list Column (8/12 width) */}
            <div className="md:col-span-8 flex flex-col gap-16 text-left">
              {FAQ_DATA.map((group) => (
                <Stack 
                  key={group.category}
                  id={group.category.toLowerCase().replace(/[^a-z0-9]/g, "-")} 
                  gap={6}
                  className="scroll-mt-32"
                >
                  <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-3">
                    {group.category}
                  </h2>
                  <div className="space-y-8">
                    {group.items.map((item, idx) => (
                      <Stack key={idx} gap={2} className="max-w-[36rem]">
                        <h3 className="text-body-md font-bold font-display text-text-primary">
                          {item.q}
                        </h3>
                        <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                          {item.a}
                        </p>
                      </Stack>
                    ))}
                  </div>
                </Stack>
              ))}
            </div>

          </Grid>
        </Container>
      </Section>

    </main>
  )
}
