/**
 * app/(shop)/terms/page.tsx — XINVORA Terms & Conditions Page
 *
 * Production-ready Terms & Conditions / Terms of Service page.
 * Effective Date: August 24, 2026.
 *
 * Layout follows the editorial two-column pattern established in returns/page.tsx
 * and shipping/page.tsx:
 *   - Sticky section index on the left (desktop only)
 *   - Main content column on the right
 *
 * Composes existing shared layout primitives. No new dependencies introduced.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "XINVORA Terms & Conditions governing use of the website, accounts, orders, payments, shipping, returns, and intellectual property. Effective August 24, 2026.",
})

/* ── Section index ────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "about-xinvora",          label: "About XINVORA" },
  { id: "eligibility",            label: "Eligibility" },
  { id: "account",                label: "XINVORA Account" },
  { id: "products",               label: "Products & Information" },
  { id: "pricing",                label: "Pricing" },
  { id: "availability",           label: "Product Availability" },
  { id: "limited-products",       label: "Limited Products" },
  { id: "orders",                 label: "Orders" },
  { id: "order-cancellation",     label: "Order Cancellation" },
  { id: "payment",                label: "Payment" },
  { id: "shipping",               label: "Shipping" },
  { id: "delivery-information",   label: "Delivery Information" },
  { id: "failed-delivery",        label: "Failed Delivery" },
  { id: "returns",                label: "Returns" },
  { id: "return-conditions",      label: "Return Conditions" },
  { id: "damaged-or-incorrect",   label: "Damaged or Incorrect" },
  { id: "size-exchanges",         label: "Size Exchanges" },
  { id: "customer-support",       label: "Customer Support" },
  { id: "intellectual-property",  label: "Intellectual Property" },
  { id: "prohibited-use",         label: "Prohibited Use" },
  { id: "website-changes",        label: "Website Changes" },
  { id: "third-party-services",   label: "Third-Party Services" },
  { id: "limitation",             label: "Limitation of Responsibility" },
  { id: "privacy",                label: "Privacy" },
  { id: "governing-law",          label: "Governing Law" },
  { id: "contact",                label: "Contact" },
]

/* ── Shared typography helpers ───────────────────────────────────────────── */
function SectionHeading({
  num,
  children,
}: {
  num: string
  children: React.ReactNode
}) {
  return (
    <h2 className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase select-none border-b border-border/40 pb-2">
      {num} / {children}
    </h2>
  )
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 text-body-sm text-text-secondary leading-relaxed"
        >
          <span
            className="mt-[0.4em] shrink-0 w-[5px] h-[5px] rounded-full bg-accent/50"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-xs text-text-tertiary border-l-2 border-accent/30 pl-3 leading-relaxed">
      {children}
    </p>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-sm text-text-secondary leading-relaxed text-pretty font-light">
      {children}
    </p>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function TermsPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">

      {/* ── Editorial Hero ── */}
      <Section id="terms-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Legal
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Terms &amp; Conditions.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              These Terms &amp; Conditions govern your use of the XINVORA
              website, your XINVORA account, and purchases made through the
              platform. By accessing or using XINVORA, you agree to these terms.
            </p>
            <p className="text-body-xs text-text-tertiary select-none">
              Effective Date: August 24, 2026
            </p>
          </Stack>
        </Container>
      </Section>

      {/* ── Two-column content layout ── */}
      <Section id="terms-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">

            {/* ── Left: Sticky section index (desktop only) ── */}
            <nav
              aria-label="Terms & Conditions sections"
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

            {/* ── Right: Main content column ── */}
            <div className="md:col-span-8 flex flex-col gap-14 text-left">

              {/* 01 — About XINVORA */}
              <Stack id="about-xinvora" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="01">About XINVORA</SectionHeading>
                <Body>
                  XINVORA is a curated fashion e-commerce brand focused on
                  carefully selected fashion products, quality control,
                  presentation, and customer experience.
                </Body>
                <Body>
                  XINVORA does not claim that every product sold through the
                  platform is manufactured or designed by XINVORA.
                </Body>
              </Stack>

              {/* 02 — Eligibility */}
              <Stack id="eligibility" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="02">Eligibility</SectionHeading>
                <Body>
                  You must be at least{" "}
                  <strong className="text-text-primary font-semibold">14 years old</strong>{" "}
                  to create an XINVORA account or place an order.
                </Body>
                <Body>By using XINVORA, you confirm that:</Body>
                <BulletList
                  items={[
                    "You meet the minimum age requirement.",
                    "The information you provide is accurate and complete.",
                    "You will use the website and services lawfully.",
                  ]}
                />
              </Stack>

              {/* 03 — XINVORA Account */}
              <Stack id="account" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="03">XINVORA Account</SectionHeading>
                <Body>
                  An account is required to place an order on XINVORA.
                </Body>
                <Body>You are responsible for:</Body>
                <BulletList
                  items={[
                    "Providing accurate account information.",
                    "Keeping your login credentials secure.",
                    "Maintaining the confidentiality of your account.",
                    "Informing XINVORA if you believe your account has been accessed without authorisation.",
                  ]}
                />
                <Body>
                  You are responsible for activity carried out through your
                  account. XINVORA may suspend or restrict an account if there
                  is suspected fraud, misuse, abuse of the platform,
                  unauthorised activity, or violation of these Terms &amp;
                  Conditions.
                </Body>
              </Stack>

              {/* 04 — Products & Product Information */}
              <Stack id="products" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="04">Products &amp; Product Information</SectionHeading>
                <Body>
                  XINVORA makes reasonable efforts to ensure that product
                  descriptions, measurements, images, prices, and other product
                  information are accurate.
                </Body>
                <Body>
                  However, slight differences may occur between images displayed
                  on the website and the physical product. Product photographs
                  may involve controlled photography, lighting, image processing,
                  or AI-assisted/generated imagery. As a result, minor
                  differences in colour, texture, tone, or appearance may occur
                  depending on lighting, photography conditions, image
                  processing, and the customer&apos;s display.
                </Body>
                <Body>
                  Such minor differences do not necessarily indicate that a
                  product is defective.
                </Body>
                <Note>
                  Customers should use the measurements and size guide provided
                  on the relevant product page when selecting a size.
                </Note>
              </Stack>

              {/* 05 — Pricing */}
              <Stack id="pricing" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="05">Pricing</SectionHeading>
                <Body>
                  All prices displayed on XINVORA are in{" "}
                  <strong className="text-text-primary font-semibold">
                    Nepalese Rupees (NPR)
                  </strong>{" "}
                  unless otherwise stated.
                </Body>
                <Body>
                  XINVORA may change product prices, discounts, promotions, or
                  offers at any time. Once an order has been successfully
                  confirmed, the applicable price for that confirmed order will
                  not be changed because of a later price adjustment.
                </Body>
              </Stack>

              {/* 06 — Product Availability */}
              <Stack id="availability" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="06">Product Availability</SectionHeading>
                <Body>
                  Products are subject to availability. XINVORA makes reasonable
                  efforts to maintain accurate inventory information.
                </Body>
                <Body>
                  In the unlikely event that a product becomes unavailable after
                  an order has been placed, XINVORA may cancel the affected order
                  and provide an applicable refund. XINVORA will make reasonable
                  efforts to prevent such situations from occurring.
                </Body>
              </Stack>

              {/* 07 — Limited Products */}
              <Stack id="limited-products" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="07">Limited Products</SectionHeading>
                <Body>
                  Products marked{" "}
                  <strong className="text-text-primary font-semibold">
                    Limited
                  </strong>{" "}
                  are released in intentionally restricted quantities.
                </Body>
                <BulletList
                  items={[
                    "Are available only while stock lasts.",
                    "Are not guaranteed to return.",
                    "Will not be restocked once sold out.",
                    "May be permanently discontinued after the available inventory is sold.",
                  ]}
                />
                <Note>
                  Limited products should therefore be considered genuinely
                  scarce releases.
                </Note>
              </Stack>

              {/* 08 — Orders */}
              <Stack id="orders" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="08">Orders</SectionHeading>
                <Body>
                  When you place an order, you are requesting to purchase the
                  selected products. An order becomes confirmed when XINVORA
                  accepts and processes the order through its system.
                </Body>
                <Body>
                  XINVORA may refuse, cancel, or restrict an order where there
                  is:
                </Body>
                <BulletList
                  items={[
                    "Suspected fraudulent activity.",
                    "Incorrect or misleading information.",
                    "Product unavailability.",
                    "Payment-related issues.",
                    "Abuse of promotions or services.",
                    "Other legitimate operational or security concerns.",
                  ]}
                />
              </Stack>

              {/* 09 — Order Cancellation */}
              <Stack id="order-cancellation" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="09">Order Cancellation</SectionHeading>
                <Body>
                  Customers may request cancellation before the order enters the
                  shipping or dispatch process. Once an order has been
                  dispatched, cancellation may no longer be possible.
                </Body>
                <Body>
                  If an eligible order is successfully cancelled and payment has
                  already been made online, the applicable refund will be
                  processed through the relevant payment/refund procedure.
                </Body>
              </Stack>

              {/* 10 — Payment */}
              <Stack id="payment" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="10">Payment</SectionHeading>
                <Body>XINVORA supports:</Body>
                <BulletList
                  items={[
                    "Cash on Delivery (COD)",
                    "Online payments",
                  ]}
                />
                <Body>
                  Online payments may be processed through available payment
                  providers, including{" "}
                  <strong className="text-text-primary font-semibold">
                    eSewa
                  </strong>{" "}
                  and{" "}
                  <strong className="text-text-primary font-semibold">
                    bank/online banking
                  </strong>
                  . Customers are responsible for completing the payment process
                  correctly.
                </Body>
                <Body>
                  If an online payment fails but the amount has been deducted,
                  contact XINVORA support at{" "}
                  <a
                    href="mailto:support.xinvora@gmail.com"
                    className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
                  >
                    support.xinvora@gmail.com
                  </a>{" "}
                  or the official XINVORA WhatsApp support channel. Provide
                  relevant transaction information when contacting support.
                </Body>
              </Stack>

              {/* 11 — Shipping */}
              <Stack id="shipping" gap={5} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="11">Shipping</SectionHeading>
                <Body>XINVORA delivers across Nepal.</Body>

                <Stack gap={3}>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                    Shipping Charges
                  </p>
                  <Body>
                    Shipping charges are calculated according to the number of
                    products in an order. The first 3 products are covered by the
                    standard NPR 150 shipping charge. Each product after the
                    first 3 adds NPR 100 to the shipping charge.
                  </Body>
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
                </Stack>

                <Stack gap={3}>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                    Estimated Delivery
                  </p>
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
                  <Note>
                    Delivery estimates are not guaranteed delivery dates.
                    Delivery may be affected by courier operations, weather,
                    public holidays, transportation disruptions, remote
                    locations, or other circumstances outside XINVORA&apos;s
                    reasonable control.
                  </Note>
                </Stack>
              </Stack>

              {/* 12 — Delivery Information */}
              <Stack id="delivery-information" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="12">Delivery Information</SectionHeading>
                <Body>
                  Customers are responsible for providing:
                </Body>
                <BulletList
                  items={[
                    "A complete delivery address.",
                    "A valid phone number.",
                    "Accurate recipient information.",
                    "Any other information reasonably required for successful delivery.",
                  ]}
                />
                <Note>
                  Incorrect or incomplete information may result in delivery
                  delays or failed delivery attempts.
                </Note>
              </Stack>

              {/* 13 — Failed Delivery */}
              <Stack id="failed-delivery" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="13">Failed Delivery</SectionHeading>
                <Body>
                  If a customer is unavailable when delivery is attempted,
                  another delivery attempt may be made. If the order still
                  cannot be delivered, the package may be returned to the
                  XINVORA warehouse.
                </Body>
                <Body>
                  If another delivery arrangement is requested after the package
                  has been returned, additional delivery arrangements or charges
                  may apply depending on the circumstances.
                </Body>
              </Stack>

              {/* 14 — Returns */}
              <Stack id="returns" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="14">Returns</SectionHeading>
                <Body>
                  Eligible products may be returned within{" "}
                  <strong className="text-text-primary font-semibold">
                    3&ndash;7 days
                  </strong>{" "}
                  after delivery, subject to XINVORA&apos;s Return Policy.
                  Customers must contact XINVORA support before sending a
                  product back.
                </Body>
                <Body>
                  A return does not automatically guarantee a refund. Returned
                  garments will be inspected and verified before a refund or
                  exchange is approved.
                </Body>
                <Note>
                  For complete requirements, refer to the dedicated{" "}
                  <a
                    href="/returns"
                    className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
                  >
                    Returns &amp; Refunds
                  </a>{" "}
                  page.
                </Note>
              </Stack>

              {/* 15 — Return Conditions */}
              <Stack id="return-conditions" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="15">Return Conditions</SectionHeading>
                <Body>
                  Returned products should generally be:
                </Body>
                <BulletList
                  items={[
                    "Unused.",
                    "Unworn.",
                    "Unwashed.",
                    "Undamaged.",
                    "Unaltered.",
                    "In their original condition.",
                    "Returned with original tags and packaging where applicable.",
                  ]}
                />
                <Note>
                  Products showing signs of wear, washing, alteration, damage,
                  misuse, or other conditions that make them unsuitable for
                  resale may not qualify for a refund or exchange.
                </Note>
              </Stack>

              {/* 16 — Damaged or Incorrect Products */}
              <Stack id="damaged-or-incorrect" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="16">Damaged or Incorrect Products</SectionHeading>
                <Body>
                  If a customer receives a damaged, defective, or incorrect
                  product, they should contact XINVORA support as soon as
                  possible. After verification, XINVORA may provide:
                </Body>
                <BulletList
                  items={[
                    "A replacement, subject to product availability; or",
                    "A refund where appropriate.",
                  ]}
                />
                <Note>
                  Customers may be asked to provide photographs or other
                  information required to verify the issue.
                </Note>
              </Stack>

              {/* 17 — Size Exchanges */}
              <Stack id="size-exchanges" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="17">Size Exchanges</SectionHeading>
                <Body>
                  Eligible size exchanges may be available depending on:
                </Body>
                <BulletList
                  items={[
                    "Product availability.",
                    "Condition of the returned product.",
                    "Whether the product satisfies XINVORA\u2019s return requirements.",
                  ]}
                />
                <Body>
                  An exchange is not guaranteed when the requested size is
                  unavailable. Limited products may be particularly difficult to
                  exchange because Limited products are never restocked.
                </Body>
              </Stack>

              {/* 18 — Customer Support */}
              <Stack id="customer-support" gap={5} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="18">Customer Support</SectionHeading>
                <Body>
                  For customer support, contact XINVORA through:
                </Body>
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
                  When contacting support regarding an existing order, include
                  the order number and relevant details whenever applicable.
                  XINVORA currently provides customer support through email and
                  WhatsApp rather than phone calls.
                </Note>
              </Stack>

              {/* 19 — Intellectual Property */}
              <Stack id="intellectual-property" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="19">Intellectual Property</SectionHeading>
                <Body>
                  All XINVORA website content is protected by applicable
                  intellectual property laws and belongs to XINVORA or the
                  respective rights holders. This includes but is not limited to:
                </Body>
                <BulletList
                  items={[
                    "XINVORA logos and branding.",
                    "Website design and interface.",
                    "Written content.",
                    "Product descriptions.",
                    "Product photography and visual content.",
                    "Graphics.",
                    "Marketing materials.",
                    "Original website features and creative assets.",
                  ]}
                />
                <Note>
                  You may not copy, reproduce, modify, distribute, publish,
                  sell, or commercially reuse XINVORA content without prior
                  written permission, except where permitted by applicable law.
                </Note>
              </Stack>

              {/* 20 — Prohibited Use */}
              <Stack id="prohibited-use" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="20">Prohibited Use</SectionHeading>
                <Body>
                  You must not use XINVORA for unlawful, fraudulent, abusive,
                  or unauthorised purposes. Specifically, you must not:
                </Body>
                <BulletList
                  items={[
                    "Attempt to gain unauthorised access to XINVORA systems or accounts.",
                    "Interfere with website functionality.",
                    "Submit fraudulent orders.",
                    "Provide intentionally false information.",
                    "Abuse discounts, promotions, returns, or other customer policies.",
                    "Attempt to manipulate inventory or order systems.",
                    "Copy or commercially exploit XINVORA content without permission.",
                    "Use automated systems to interfere with normal website operation.",
                  ]}
                />
                <Note>
                  XINVORA may restrict or terminate access where misuse is
                  identified.
                </Note>
              </Stack>

              {/* 21 — Website Changes */}
              <Stack id="website-changes" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="21">Website Changes</SectionHeading>
                <Body>
                  XINVORA may modify, update, suspend, or discontinue parts of
                  the website when reasonably necessary. This may include
                  products, prices, promotions, website features, services,
                  content, and policies.
                </Body>
                <Body>
                  XINVORA may also update these Terms &amp; Conditions from time
                  to time. The updated version will display a revised effective
                  date. Continued use of XINVORA after an updated version
                  becomes effective constitutes acceptance of the updated Terms
                  &amp; Conditions, subject to applicable law.
                </Body>
              </Stack>

              {/* 22 — Third-Party Services */}
              <Stack id="third-party-services" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="22">Third-Party Services</SectionHeading>
                <Body>
                  XINVORA may rely on third-party services to operate certain
                  parts of the platform, including payment, delivery,
                  communication, infrastructure, and other operational services.
                  Third-party services operate according to their own applicable
                  terms and policies.
                </Body>
                <Note>
                  XINVORA is not responsible for independent failures or
                  interruptions caused by third-party providers outside
                  XINVORA&apos;s reasonable control.
                </Note>
              </Stack>

              {/* 23 — Limitation of Responsibility */}
              <Stack id="limitation" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="23">Limitation of Responsibility</SectionHeading>
                <Body>
                  XINVORA makes reasonable efforts to provide accurate product
                  information, reliable website functionality, and timely order
                  processing. However, XINVORA is not responsible for delays,
                  interruptions, or failures caused by circumstances outside its
                  reasonable control. These may include:
                </Body>
                <BulletList
                  items={[
                    "Courier disruptions.",
                    "Extreme weather.",
                    "Public holidays.",
                    "Transportation issues.",
                    "Internet or network failures.",
                    "Payment-provider interruptions.",
                    "Third-party service failures.",
                    "Other events outside XINVORA\u2019s reasonable control.",
                  ]}
                />
                <Note>
                  Nothing in these Terms &amp; Conditions is intended to exclude
                  or limit any rights or protections that cannot legally be
                  excluded or limited under applicable law.
                </Note>
              </Stack>

              {/* 24 — Privacy */}
              <Stack id="privacy" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="24">Privacy</SectionHeading>
                <Body>
                  Your use of XINVORA is also subject to the{" "}
                  <a
                    href="/privacy"
                    className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </a>{" "}
                  and Cookie Policy. These policies explain how information and
                  cookies are handled when you use the website.
                </Body>
              </Stack>

              {/* 25 — Governing Law */}
              <Stack id="governing-law" gap={4} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="25">Governing Law</SectionHeading>
                <Body>
                  These Terms &amp; Conditions are governed by the laws of{" "}
                  <strong className="text-text-primary font-semibold">Nepal</strong>.
                  Any dispute relating to XINVORA, its services, products,
                  orders, or these Terms &amp; Conditions will be handled
                  according to applicable laws and jurisdiction in Nepal.
                </Body>
              </Stack>

              {/* 26 — Contact */}
              <Stack id="contact" gap={5} className="scroll-mt-32 max-w-[36rem]">
                <SectionHeading num="26">Contact</SectionHeading>
                <Body>
                  For questions regarding these Terms &amp; Conditions, orders,
                  returns, payments, or other customer support matters, contact
                  XINVORA through:
                </Body>
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
              </Stack>

            </div>
          </Grid>
        </Container>
      </Section>

    </main>
  )
}
