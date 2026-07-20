import { AnalyticsRepository } from "@/repositories/analytics.repository"
import { CookieConsentRepository } from "@/repositories/cookie-consent.repository"
import type { AnalyticsEventPayload } from "@/types/analytics"

export class AnalyticsService {
  static async recordEventsBatch(events: AnalyticsEventPayload[]) {
    return await AnalyticsRepository.insertEventsBatch(events)
  }

  static async recordSearch(data: { query: string; resultsCount: number; userId?: string; sessionId?: string }) {
    return await AnalyticsRepository.recordSearchQuery({
      query: data.query,
      resultsCount: data.resultsCount,
      userId: data.userId,
      sessionId: data.sessionId,
    })
  }

  static async getExecutiveDashboardMetrics() {
    const analyticsMetrics = await AnalyticsRepository.getExecutiveMetrics()
    const consentStats = await CookieConsentRepository.getOptInStats()

    return {
      ...analyticsMetrics,
      privacy: {
        totalConsents: consentStats.totalConsents,
        analyticsOptInRate: consentStats.analyticsOptInRate,
        marketingOptInRate: consentStats.marketingOptInRate,
        personalizationOptInRate: consentStats.personalizationOptInRate,
      },
    }
  }
}
