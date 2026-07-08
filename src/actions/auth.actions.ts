"use server"

import { AuthError } from "next-auth"
import { signIn, signOut } from "@/auth"
import { AuthenticationService } from "@/services/authentication.service"
import { SessionService } from "@/services/session.service"
import { CartService } from "@/services/cart.service"
import { registerSchema, loginSchema } from "@/validations/auth"
import { validateInput, handleServiceCall } from "@/services/shared/action-utils"
import type { ActionResult } from "@/types/actions"
import { cookies } from "next/headers"

/**
 * Register a new user securely.
 */
export async function registerAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const data = Object.fromEntries(formData.entries())
  
  const validation = validateInput(registerSchema, data)
  if (!validation.success) {
    return validation
  }

  return handleServiceCall(() => AuthenticationService.register(validation.data))
}

/**
 * Authenticate and log in a user.
 */
export async function loginAction(
  prevState: ActionResult<unknown> | null,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const data = Object.fromEntries(formData.entries())

  const validation = validateInput(loginSchema, data)
  if (!validation.success) {
    return validation
  }

  try {
    await signIn("credentials", {
      ...validation.data,
      redirect: false, // We will handle redirection on the client or manually
    })
    
    // Merge Guest Cart
    const user = await SessionService.optionalAuth()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("cart_session")?.value
    
    let skippedCount = 0
    if (user && sessionId) {
      const mergeResult = await CartService.mergeGuestCart(sessionId, user.id)
      skippedCount = mergeResult?.skippedCount || 0
      cookieStore.delete("cart_session")
    }

    return {
      success: true,
      data: { 
        message: "Login successful",
        skippedCount
      },
    }
  } catch (error) {
    if (error instanceof AuthError) {
      const cause = error.cause as any
      const originalError = cause?.err || cause
      if (originalError && originalError.message && originalError.message.includes("Too many login attempts")) {
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: originalError.message,
          },
        }
      }

      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid email or password.",
            },
          }
        default:
          return {
            success: false,
            error: {
              code: "UNKNOWN",
              message: "Authentication failed. Please try again.",
            },
          }
      }
    }
    // Auth.js 'signIn' with redirect=true actually throws NEXT_REDIRECT.
    // If we set redirect: false, it returns an object, but if it's an error it might throw.
    // Wait, in Auth.js v5 beta, signIn('credentials', { redirect: false }) returns { error: ... } or { ok: true }
    // Let's actually use redirect: false and check the response if it doesn't throw.
    // However, if we do want to redirect seamlessly without returning an action result, we can just throw.
    // Let's keep it simple: we want to return ActionResult to display errors via useFormState.
    console.error("[loginAction] Unexpected error:", error)
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "An unexpected error occurred.",
      },
    }
  }
}

/**
 * Log out the current user.
 */
export async function logoutAction(): Promise<ActionResult<unknown>> {
  try {
    await signOut({ redirect: false })
    return {
      success: true,
      data: { message: "Logged out successfully" },
    }
  } catch (error) {
    console.error("[logoutAction] Error:", error)
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "Failed to log out.",
      },
    }
  }
}
