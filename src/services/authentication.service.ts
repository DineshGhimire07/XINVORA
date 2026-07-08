import "server-only"
import * as argon2 from "argon2"
import { UserService } from "./user.service"
import { DomainError, DomainErrorCode } from "./errors"
import type { RegisterInput, LoginInput } from "@/validations/auth"

class LoginRateLimiter {
  private static attempts = new Map<string, { count: number; lockedUntil: number }>()

  public static checkRateLimit(email: string): void {
    const key = email.toLowerCase().trim()
    const record = this.attempts.get(key)
    if (!record) return

    const now = Date.now()
    if (now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000)
      throw new DomainError(
        DomainErrorCode.UNAUTHORIZED,
        `Too many login attempts. Please try again in ${remainingSeconds} seconds.`
      )
    }
  }

  public static recordFailure(email: string): void {
    const key = email.toLowerCase().trim()
    const record = this.attempts.get(key) || { count: 0, lockedUntil: 0 }
    
    const now = Date.now()
    // Reset attempt count if lock period has expired
    if (now > record.lockedUntil && record.lockedUntil > 0) {
      record.count = 1
      record.lockedUntil = 0
    } else {
      record.count = record.count + 1
    }

    if (record.count >= 5) {
      // Lock for 15 minutes (900 seconds)
      record.lockedUntil = now + 15 * 60 * 1000
    }
    
    this.attempts.set(key, record)
  }

  public static recordSuccess(email: string): void {
    const key = email.toLowerCase().trim()
    this.attempts.delete(key)
  }
}

export class AuthenticationService {
  /**
   * Register a new user securely.
   * Hashes the password and delegates creation to UserService.
   */
  public static async register(input: RegisterInput) {
    try {
      // 1. Hash password with Argon2id
      const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
      })

      // 2. Delegate to UserService
      const user = await UserService.createUser(input, passwordHash)

      // 3. Audit Log placeholder
      // TODO: Audit event: "User registered" (Time, IP, User Agent, Success)

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    } catch (error) {
      if (error instanceof DomainError) throw error
      
      console.error("[AuthenticationService.register] Error:", error)
      throw new DomainError(
        DomainErrorCode.UNKNOWN,
        "Registration failed due to an unexpected error."
      )
    }
  }

  /**
   * Verify credentials for login.
   * Uses constant-time generic error messages to prevent email enumeration.
   */
  public static async verifyCredentials(input: LoginInput) {
    try {
      // Check rate limit threshold before querying database
      LoginRateLimiter.checkRateLimit(input.email)

      // 1. Fetch user (UserService handles normalization)
      const user = await UserService.getUserByEmail(input.email)
      
      if (!user || !user.passwordHash) {
        // Increment and track failed attempt
        LoginRateLimiter.recordFailure(input.email)
        
        throw new DomainError(
          DomainErrorCode.UNAUTHORIZED,
          "Invalid email or password."
        )
      }

      // 2. Verify password
      const isValidPassword = await argon2.verify(user.passwordHash, input.password)
      
      if (!isValidPassword) {
        // Increment and track failed attempt
        LoginRateLimiter.recordFailure(input.email)

        throw new DomainError(
          DomainErrorCode.UNAUTHORIZED,
          "Invalid email or password."
        )
      }

      // 3. Login success — clear rate limiting state
      LoginRateLimiter.recordSuccess(input.email)

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    } catch (error) {
      if (error instanceof DomainError) throw error
      
      console.error("[AuthenticationService.verifyCredentials] Error:", error)
      throw new DomainError(
        DomainErrorCode.UNKNOWN,
        "Authentication failed due to an unexpected error."
      )
    }
  }
}
