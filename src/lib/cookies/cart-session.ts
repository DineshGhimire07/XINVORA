import crypto from "crypto"

const CART_SECRET = process.env.NEXTAUTH_SECRET || "fallback_cart_signing_secret_key_12345"

export function signSessionId(id: string): string {
  const signature = crypto.createHmac("sha256", CART_SECRET).update(id).digest("hex")
  return `${id}.${signature}`
}

export function verifyAndExtractSessionId(signedValue: string | undefined): string | null {
  if (!signedValue) return null
  const parts = signedValue.split(".")
  if (parts.length !== 2) return null
  const [id, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", CART_SECRET).update(id).digest("hex")
  if (signature === expectedSignature) {
    return id
  }
  return null
}
