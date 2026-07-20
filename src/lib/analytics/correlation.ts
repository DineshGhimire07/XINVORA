let currentCorrelationId: string | null = null

export function getCorrelationId(): string {
  if (typeof window === "undefined") {
    return `corr_${crypto.randomUUID().replace(/-/g, "")}`
  }

  if (!currentCorrelationId) {
    const sessionKey = "xinvora_corr_id"
    const stored = sessionStorage.getItem(sessionKey)
    if (stored) {
      currentCorrelationId = stored
    } else {
      currentCorrelationId = `corr_${crypto.randomUUID().replace(/-/g, "")}`
      sessionStorage.setItem(sessionKey, currentCorrelationId)
    }
  }

  return currentCorrelationId
}
