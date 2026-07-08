import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import { LoginForm } from "./LoginForm"

export const metadata = buildMetadata({
  title: "Login",
  description: "Sign in to your XINVORA account.",
})

export default function LoginPage() {
  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16 min-h-screen flex items-center justify-center">
      <Container>
        <Section id="login-form" padding="md" className="bg-background">
          <Stack gap={8} className="text-center">
            <Stack gap={3}>
              <h1 className="text-display-sm font-display text-text-primary leading-tight tracking-tight">
                Welcome Back
              </h1>
              <p className="text-body-md text-text-secondary leading-relaxed text-pretty max-w-md mx-auto">
                Sign in to access your saved items, order history, and exclusive editorial content.
              </p>
            </Stack>

            <LoginForm />

            <div className="pt-6 border-t border-border/40 text-body-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-text-primary hover:text-accent font-semibold underline underline-offset-4 transition-colors">
                Register here
              </Link>
            </div>
          </Stack>
        </Section>
      </Container>
    </main>
  )
}
