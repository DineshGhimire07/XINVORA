/**
 * services/shared/action-utils.ts — XINVORA Server Action Utilities
 *
 * Shared helpers that every Server Action uses.
 *
 * WHY THIS EXISTS:
 * Server Actions are thin wrappers: validate → call service → return ActionResult.
 * The repetitive try/catch + DomainError mapping is extracted here so every
 * action stays under ~20 lines of focused logic.
 *
 * RULE: These utilities MUST NOT import React, components, or UI code.
 */

import "server-only"
import { ZodSchema } from "zod"
import type { ActionResult } from "@/types/actions"
import { isDomainError } from "../errors"

/**
 * Validates `formData` against a Zod schema and returns structured field errors
 * as an `ActionResult` if validation fails.
 *
 * Returns `{ success: true, data }` when valid so the action can proceed.
 * Returns `{ success: false, error }` immediately when invalid.
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown
): ActionResult<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<
      string,
      string[]
    >
    return {
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Please correct the errors below.",
        fieldErrors,
      },
    }
  }
  return { success: true, data: result.data }
}

/**
 * Wraps any service call in a standard try/catch, converting:
 *   - `DomainError` → structured `ActionResult` failure
 *   - Unknown errors → generic `UNKNOWN` failure (no stack trace to UI)
 *
 * Usage inside a Server Action:
 *
 *   return await handleServiceCall(() => MyService.doSomething(input))
 */
export async function handleServiceCall<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    if (isDomainError(err)) {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          fieldErrors: err.fieldErrors,
        },
      }
    }

    // Log the unexpected error server-side but never expose internals to client.
    // In Phase 4G+ we will integrate a proper observability service here.
    console.error("[XINVORA] Unhandled service error:", err)

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "Something went wrong. Please try again.",
      },
    }
  }
}
