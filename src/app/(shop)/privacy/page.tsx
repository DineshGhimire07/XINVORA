/**
 * app/privacy/page.tsx — XINVORA Privacy Policy Page
 *
 * Production-ready Privacy Policy.
 * Composes existing shared layout primitives and follows XINVORA's strict editorial design.
 * Uses the same sticky-left-nav + right-content column layout pattern as the Returns & FAQ pages.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import * as React from "react"

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "XINVORA Privacy Policy — what personal information we collect, why it is collected, how it is used, how it is protected, and the choices available to you.",
})

/* ── Section index for sticky left nav ───────────────────────────────────── */
const SECTIONS = [
  { id: "information-we-collect",      label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "order-communications",        label: "Order Communications" },
  { id: "marketing-communications",    label: "Marketing Communications" },
  { id: "third-party-services",        label: "Third-Party Services" },
  { id: "payment-providers",           label: "Payment Providers" },
  { id: "cookies",                     label: "Cookies" },
  { id: "data-security",               label: "Data Security" },
  { id: "data-retention",              label: "Data Retention" },
  { id: "your-privacy-choices",        label: "Your Privacy Choices" },
  { id: "account-deletion",            label: "Account Deletion" },
  { id: "childrens-privacy",           label: "Children's Privacy" },
  { id: "policy-changes",              label: "Policy Changes" },
  { id: "contact-us",                  label: "Contact Us" },
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

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-xs text-text-tertiary border-l-2 border-accent/30 pl-3 leading-relaxed">
      {children}
    </p>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">

      {/* ── Editorial Hero ── */}
      <Section id="privacy-hero" padding="md" className="bg-background">
        <Container>
          <Stack gap={6} className="max-w-[32rem] text-left">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Legal
            </span>
            <h1 className="text-display-lg font-display text-text-primary leading-tight tracking-tight">
              Privacy Policy.
            </h1>
            <p className="text-body-md text-text-secondary leading-relaxed text-pretty">
              At XINVORA, we respect your privacy and take reasonable steps to
              protect the information you provide when using our website,
              creating an account, placing an order, or contacting our support
              team.
            </p>
            <p className="text-body-xs text-text-tertiary select-none">
              Effective Date: August 24, 2026
            </p>
          </Stack>
        </Container>
      </Section>

      {/* ── Content ── */}
      <Section id="privacy-content" padding="lg" className="bg-background">
        <Container>
          <Grid cols={{ base: 1, md: 12 }} gap={12} className="items-start">

            {/* ── Sticky left nav (desktop only) ── */}
            <nav
              aria-label="Privacy policy sections"
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

              {/* 01 — Information We Collect */}
              <Stack
                id="information-we-collect"
                gap={6}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>01 / Information We Collect</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  When you use XINVORA, we may collect information necessary to
                  provide our services.
                </p>

                <Stack gap={3}>
                  <SubHeading>Account Information</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    When you create an XINVORA account, we may collect:
                  </p>
                  <ConditionList
                    items={[
                      "Name",
                      "Email address",
                      "Phone number",
                      "Account credentials",
                      "Other information required to maintain your account",
                    ]}
                  />
                  <Note>
                    An account is required to place an order on XINVORA.
                  </Note>
                </Stack>

                <Stack gap={3}>
                  <SubHeading>Delivery Information</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    When you place an order, we may collect information required
                    to deliver your purchase, including:
                  </p>
                  <ConditionList
                    items={[
                      "Delivery address",
                      "Phone number",
                      "Recipient name",
                      "Order-related delivery details",
                    ]}
                  />
                </Stack>

                <Stack gap={3}>
                  <SubHeading>Order Information</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    We may retain information relating to your purchases,
                    including:
                  </p>
                  <ConditionList
                    items={[
                      "Products ordered",
                      "Order number",
                      "Order status",
                      "Order history",
                      "Delivery information",
                      "Payment status",
                      "Return or exchange information where applicable",
                    ]}
                  />
                </Stack>

                <Stack gap={3}>
                  <SubHeading>Payment Information</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                    XINVORA supports online payments through available payment
                    methods including eSewa and bank/online banking. XINVORA
                    does not need to store your complete banking credentials or
                    payment passwords to process your order. Payment transactions
                    may be processed by the relevant payment provider or
                    financial institution according to their own privacy and
                    security practices.
                  </p>
                </Stack>

                <Stack gap={3}>
                  <SubHeading>Customer Support Information</SubHeading>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    If you contact XINVORA through email or WhatsApp, we may
                    receive information you voluntarily provide, such as:
                  </p>
                  <ConditionList
                    items={[
                      "Name",
                      "Contact information",
                      "Order number",
                      "Messages",
                      "Information about your issue or request",
                      "Images or other information you choose to send to us",
                    ]}
                  />
                  <Note>
                    We use this information to respond to your request and
                    provide customer support.
                  </Note>
                </Stack>
              </Stack>

              {/* 02 — How We Use Your Information */}
              <Stack
                id="how-we-use-your-information"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>02 / How We Use Your Information</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA may use collected information to:
                </p>
                <ConditionList
                  items={[
                    "Create and manage your account.",
                    "Process and manage orders.",
                    "Confirm and fulfill purchases.",
                    "Arrange product delivery.",
                    "Provide order status information.",
                    "Process eligible returns, exchanges, and refunds.",
                    "Respond to customer support requests.",
                    "Send order-related emails.",
                    "Send relevant service and delivery updates.",
                    "Maintain and improve the XINVORA website.",
                    "Prevent fraud, abuse, and unauthorized activity.",
                    "Comply with applicable legal obligations.",
                  ]}
                />
                <Note>
                  We use personal information only for legitimate business and
                  service purposes.
                </Note>
              </Stack>

              {/* 03 — Order & Transaction Communications */}
              <Stack
                id="order-communications"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>03 / Order &amp; Transaction Communications</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  When you place an order, XINVORA may send emails relating to
                  your order or account. These may include:
                </p>
                <ConditionList
                  items={[
                    "Order confirmation",
                    "Order status updates",
                    "Shipping or delivery updates",
                    "Return or refund communication",
                    "Important account or service notifications",
                  ]}
                />
                <Note>
                  These communications are part of providing the service you
                  requested.
                </Note>
              </Stack>

              {/* 04 — Marketing Communications */}
              <Stack
                id="marketing-communications"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>04 / Marketing Communications</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Where applicable, XINVORA may send promotional or marketing
                  communications, such as information about products,
                  collections, offers, or updates. Where an unsubscribe option
                  is provided, you may use it to stop receiving marketing
                  communications.
                </p>
                <Note>
                  Service-related communications, such as important order or
                  account updates, may still be sent when necessary.
                </Note>
              </Stack>

              {/* 05 — Third-Party Services */}
              <Stack
                id="third-party-services"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>05 / Third-Party Services</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA may use third-party service providers to operate parts
                  of the website and fulfill services. These may include:
                </p>
                <ConditionList
                  items={[
                    "Payment providers",
                    "Delivery and courier partners",
                    "Email or communication services",
                    "Website infrastructure and technical service providers",
                    "Other service providers necessary to operate XINVORA",
                  ]}
                />
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Third-party providers may receive only the information
                  reasonably necessary for the service they provide. For
                  example, delivery partners may receive the information required
                  to deliver an order.
                </p>
                <Note>
                  XINVORA does not intentionally provide third parties with
                  personal information unrelated to the service they are
                  providing. Third-party providers may have their own privacy
                  policies and terms governing their services.
                </Note>
              </Stack>

              {/* 06 — Payment Providers */}
              <Stack
                id="payment-providers"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>06 / Payment Providers</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Online payments may be processed through eSewa and bank/online
                  banking services. When you make a payment, certain transaction
                  information may be processed by the relevant payment provider
                  or financial institution.
                </p>
                <Note>
                  XINVORA does not request or require customers to provide their
                  banking passwords, PINs, or similar confidential payment
                  credentials directly to XINVORA. Customers should only enter
                  sensitive payment information through the official payment
                  interface provided by the relevant payment provider.
                </Note>
              </Stack>

              {/* 07 — Cookies */}
              <Stack
                id="cookies"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>07 / Cookies</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA uses cookies and similar technologies where necessary
                  for website functionality, account sessions, preferences, and
                  other permitted purposes.
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  For detailed information about cookies and how they are used,
                  please refer to our{" "}
                  <Link
                    href="/cookies"
                    className="text-text-primary underline underline-offset-2 hover:text-accent transition-colors"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </Stack>

              {/* 08 — Data Security */}
              <Stack
                id="data-security"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>08 / Data Security</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA takes reasonable technical and organizational measures
                  to protect personal information against unauthorized access,
                  misuse, loss, alteration, or disclosure.
                </p>
                <Note>
                  No internet-based service can guarantee absolute security.
                  Customers should also take reasonable precautions to protect
                  their account credentials and avoid sharing passwords or other
                  confidential account information.
                </Note>
              </Stack>

              {/* 09 — Data Retention */}
              <Stack
                id="data-retention"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>09 / Data Retention</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA may retain personal information for as long as
                  reasonably necessary to:
                </p>
                <ConditionList
                  items={[
                    "Maintain your account.",
                    "Fulfill orders.",
                    "Maintain transaction and order records.",
                    "Handle returns, refunds, and customer support.",
                    "Meet legal, accounting, or regulatory requirements.",
                    "Resolve disputes.",
                    "Prevent fraud or misuse.",
                  ]}
                />
                <Note>
                  When information is no longer reasonably required, it may be
                  deleted or securely disposed of where appropriate.
                </Note>
              </Stack>

              {/* 10 — Your Privacy Choices */}
              <Stack
                id="your-privacy-choices"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>10 / Your Privacy Choices</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  Depending on the circumstances and applicable law, you may
                  request to:
                </p>
                <ConditionList
                  items={[
                    "Access information associated with your account.",
                    "Correct inaccurate account information.",
                    "Request deletion of your account or personal information.",
                    "Ask questions about how your information is used.",
                  ]}
                />
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  To make a privacy-related request, contact:{" "}
                  <a
                    href="mailto:support.xinvora@gmail.com"
                    className="text-text-primary underline underline-offset-2 hover:text-accent transition-colors break-all"
                  >
                    support.xinvora@gmail.com
                  </a>
                </p>
                <Note>
                  XINVORA may need to verify your identity before processing
                  certain requests. Some information may need to be retained
                  where required for legitimate business, legal, accounting,
                  security, or regulatory purposes.
                </Note>
              </Stack>

              {/* 11 — Account Deletion */}
              <Stack
                id="account-deletion"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>11 / Account Deletion</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  If you want to delete your XINVORA account or request deletion
                  of associated personal information, contact:{" "}
                  <a
                    href="mailto:support.xinvora@gmail.com"
                    className="text-text-primary underline underline-offset-2 hover:text-accent transition-colors break-all"
                  >
                    support.xinvora@gmail.com
                  </a>
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  We will review the request and take appropriate action,
                  subject to information that must legally or legitimately be
                  retained.
                </p>
                <Note>
                  Deleting an account does not necessarily require the immediate
                  deletion of transaction records that XINVORA is required or
                  permitted to retain.
                </Note>
              </Stack>

              {/* 12 — Children's Privacy */}
              <Stack
                id="childrens-privacy"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>12 / Children&apos;s Privacy</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA accounts and purchases are available to individuals
                  aged{" "}
                  <strong className="text-text-primary font-semibold">
                    14 and above
                  </strong>
                  . XINVORA does not knowingly allow children under the age of
                  14 to create accounts or place orders.
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  If you believe that a child under 14 has provided personal
                  information to XINVORA, please contact us at:{" "}
                  <a
                    href="mailto:support.xinvora@gmail.com"
                    className="text-text-primary underline underline-offset-2 hover:text-accent transition-colors break-all"
                  >
                    support.xinvora@gmail.com
                  </a>
                </p>
              </Stack>

              {/* 13 — Policy Changes */}
              <Stack
                id="policy-changes"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>13 / Changes to This Privacy Policy</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  XINVORA may update this Privacy Policy when our services,
                  technology, business practices, or legal requirements change.
                  When significant changes are made, we may communicate the
                  update through the website or other appropriate channels.
                </p>
                <Note>
                  The updated Privacy Policy will display a revised effective
                  date.
                </Note>
              </Stack>

              {/* 14 — Contact Us */}
              <Stack
                id="contact-us"
                gap={5}
                className="scroll-mt-32 max-w-[36rem]"
              >
                <SectionHeading>14 / Contact Us</SectionHeading>
                <p className="text-body-sm text-text-secondary leading-relaxed text-pretty">
                  If you have questions, concerns, or requests relating to this
                  Privacy Policy or your personal information, please include
                  relevant details such as your account email or order number
                  where necessary to help us process your request.
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
                  XINVORA currently provides customer support through email and
                  WhatsApp rather than phone calls.
                </Note>
              </Stack>

            </div>
          </Grid>
        </Container>
      </Section>

    </main>
  )
}
