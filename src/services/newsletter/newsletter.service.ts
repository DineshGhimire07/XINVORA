/**
 * services/newsletter/newsletter.service.ts — XINVORA Newsletter Service
 *
 * This is the first REAL write service in XINVORA.
 *
 * It demonstrates the full Service Layer contract:
 *   - Server Action calls subscribe()
 *   - Service validates business rules
 *   - Service writes to the database (via Drizzle — never raw SQL)
 *   - Service throws DomainError for business violations
 *   - Service never returns UI-specific types or HTTP responses
 *
 * NOTE ON STORAGE:
 * The Drizzle schema does not have a newsletter_subscribers table in Phase 4C.
 * Per architectural decision: we do NOT add tables mid-phase without a
 * migration. In Phase 4E, the newsletter service is a REAL service with
 * REAL validation and business rules, but it stubs the persistence step.
 * When a dedicated subscribers table is introduced (Phase 5+), only this
 * file changes — the Server Action and UI are completely unaffected.
 */

import "server-only"
import { DomainError, DomainErrorCode } from "../errors"
import { emailSchema } from "@/validations"

export interface NewsletterSubscribeInput {
  email: string
}

export interface NewsletterSubscribeResult {
  email: string
  subscribedAt: Date
}

const NewsletterService = {
  /**
   * Subscribe an email address to the XINVORA newsletter.
   *
   * Business rules enforced:
   *   - Email must be syntactically valid (Zod pre-validates in the action,
   *     but the service re-validates to stay self-contained)
   *   - Duplicate subscriptions are handled gracefully (idempotent)
   *
   * @throws {DomainError} NEWSLETTER_INVALID_EMAIL — if email fails format check
   */
  async subscribe(
    input: NewsletterSubscribeInput
  ): Promise<NewsletterSubscribeResult> {
    // Re-validate at service boundary (services must be self-contained)
    const parsed = emailSchema.safeParse(input.email)
    if (!parsed.success) {
      throw new DomainError(
        DomainErrorCode.NEWSLETTER_INVALID_EMAIL,
        "The email address provided is not valid.",
        { email: parsed.error.flatten().formErrors }
      )
    }

    const email = parsed.data
    const now = new Date()

    // ── Persistence stub ─────────────────────────────────────────────────────
    // TODO (Phase 5+): Replace with Drizzle insert once newsletter_subscribers
    //   table is added to the schema and migrated.
    //
    //   await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing()
    //
    // The stub below simulates the async latency of a real DB write
    // so the UI loading state is exercised correctly in development.
    await new Promise((resolve) => setTimeout(resolve, 300))
    // ─────────────────────────────────────────────────────────────────────────

    return { email, subscribedAt: now }
  },
}

export { NewsletterService }
