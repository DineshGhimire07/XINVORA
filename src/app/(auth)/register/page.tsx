import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import { RegisterForm } from "./RegisterForm"

export const metadata = buildMetadata({
  title: "Create Account",
  description: "Register for a new XINVORA account.",
})

export default function RegisterPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16 min-h-screen flex items-center justify-center">
      <Container>
        <Section id="register-form" padding="md" className="bg-background">
          <Stack gap={8} className="text-center">
            <Stack gap={3}>
              <h1 className="text-display-sm font-display text-text-primary leading-tight tracking-tight">
                Create Account
              </h1>
              <p className="text-body-md text-text-secondary leading-relaxed text-pretty max-w-md mx-auto">
                Join XINVORA to curate your wishlist and expedite your checkout experience.
              </p>
            </Stack>

            <RegisterForm />

            <div className="pt-6 border-t border-border/40 text-body-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-text-primary hover:text-accent font-semibold underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </div>
          </Stack>
        </Section>
      </Container>
    </main>
  )
}
