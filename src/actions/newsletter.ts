"use server"

/**
 * actions/newsletter.ts — XINVORA Newsletter Server Action
 *
 * RULE (RULE-ARCH-08): This action must NEVER call Drizzle directly.
 * It delegates to NewsletterService and returns ActionResult<T>.
 *
 * Server Actions must stay thin:
 *   1. Extract & validate input
 *   2. Call Service
 *   3. Return ActionResult
 *
 * Nothing else belongs here.
 */

import { newsletterSchema } from "@/validations"
import type { ActionResult } from "@/types/actions"
import { NewsletterService } from "@/services/newsletter/newsletter.service"
import { validateInput, handleServiceCall } from "@/services/shared/action-utils"

export interface NewsletterActionData {
  email: string
  subscribedAt: string // ISO string — safe to serialize across the server/client boundary
}

/**
 * Subscribe an email address to the XINVORA newsletter.
 *
 * Compatible with React's `useActionState` and plain `<form action={...}>`.
 * The `prevState` parameter is required by the useActionState signature
 * even though we do not use it in this action.
 */
export async function subscribeToNewsletter(
  _prevState: ActionResult<NewsletterActionData> | null,
  formData: FormData
): Promise<ActionResult<NewsletterActionData>> {
  // Step 1: Extract and validate
  const validation = validateInput(newsletterSchema, {
    email: formData.get("email"),
  })
  if (!validation.success) return validation

  // Step 2: Call Service (all business rules live inside the service)
  return handleServiceCall(async () => {
    const result = await NewsletterService.subscribe({
      email: validation.data.email,
    })
    return {
      email: result.email,
      subscribedAt: result.subscribedAt.toISOString(),
    }
  })
}
