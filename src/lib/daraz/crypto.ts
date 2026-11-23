import crypto from "crypto"

/**
 * Derives a consistent 32-byte key from AUTH_SECRET or DARAZ_APP_SECRET
 */
function getEncryptionKey(secretOverride?: string): Buffer {
  const secret = secretOverride || process.env.DARAZ_ENCRYPTION_KEY || process.env.AUTH_SECRET || "xinvora-daraz-fallback-encryption-key-32b"
  return crypto.createHash("sha256").update(secret).digest()
}

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16

/**
 * Encrypts sensitive tokens (AccessToken, RefreshToken) using AES-256-GCM.
 * Output format: iv:authTag:encryptedData (hex encoded)
 */
export function encryptDarazToken(plainText: string, secretOverride?: string): string {
  if (!plainText) return ""
  const key = getEncryptionKey(secretOverride)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

  let encrypted = cipher.update(plainText, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")

  return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

/**
 * Decrypts tokens encrypted with encryptDarazToken.
 */
export function decryptDarazToken(encryptedPayload: string, secretOverride?: string): string {
  if (!encryptedPayload) return ""
  const parts = encryptedPayload.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token payload format.")
  }

  const [ivHex, authTagHex, encryptedDataHex] = parts
  const key = getEncryptionKey(secretOverride)
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedDataHex, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
