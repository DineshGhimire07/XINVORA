const ANON_ID_COOKIE = "xinvora_anon_id"

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") {
    return `anon_${crypto.randomUUID().replace(/-/g, "")}`
  }

  // Try reading cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${ANON_ID_COOKIE}=([^;]*)`))
  if (match && match[1]) {
    return match[1]
  }

  // Generate new anonymous ID
  const newAnonId = `anon_${crypto.randomUUID().replace(/-/g, "")}`
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${ANON_ID_COOKIE}=${newAnonId}; expires=${expires}; path=/; SameSite=Lax`

  return newAnonId
}
