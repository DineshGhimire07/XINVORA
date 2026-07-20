import crypto from "crypto"

const COOKIE_SECRET = process.env.COOKIE_HMAC_SECRET || process.env.NEXTAUTH_SECRET || "xinvora_enterprise_hmac_secret_key_2026"

/**
 * Generates an HMAC SHA-256 signature for a string payload
 */
export function generateHmacSignature(payload: string): string {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(payload).digest("hex")
}

/**
 * Verifies an HMAC SHA-256 signature
 */
export function verifyHmacSignature(payload: string, signature: string): boolean {
  try {
    const expectedSig = generateHmacSignature(payload)
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSig, "hex"))
  } catch {
    return false
  }
}

/**
 * Generates a privacy-preserving hashed IP address SHA-256(IP + server_secret)
 */
export function hashIpAddress(rawIp: string | null | undefined): string {
  if (!rawIp || rawIp === "::1" || rawIp === "127.0.0.1") {
    return crypto.createHash("sha256").update(`127.0.0.1_${COOKIE_SECRET}`).digest("hex")
  }
  return crypto.createHash("sha256").update(`${rawIp}_${COOKIE_SECRET}`).digest("hex")
}
