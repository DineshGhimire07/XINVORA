import { eq, desc, sql, count } from "drizzle-orm"
import { db } from "@/db/client"
import { contactInquiries } from "@/db/schema"

export type InquirySearchParams = {
  page?: number
  limit?: number
  status?: string
}

export class InquiryService {
  /**
   * Storefront: Submits a new inquiry.
   */
  static async submitInquiry(data: { name: string; email: string; subject: string; message: string }) {
    await db.insert(contactInquiries).values({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'NEW',
    })
  }

  /**
   * Admin: Fetches paginated inquiries.
   */
  static async getInquiries(params: InquirySearchParams) {
    const { page = 1, limit = 20, status } = params
    const offset = (page - 1) * limit
    
    let whereClause = undefined
    if (status && status !== "all") {
      whereClause = eq(contactInquiries.status, status as any)
    }

    const data = await db.query.contactInquiries.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(contactInquiries.createdAt)],
    })

    const countRes = await db.select({ val: count() }).from(contactInquiries).where(whereClause)
    const totalCount = countRes[0]?.val ?? 0

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    }
  }

  /**
   * Admin: Updates inquiry status.
   */
  static async updateInquiryStatus(id: string, newStatus: 'NEW' | 'READ' | 'RESPONDED') {
    await db.update(contactInquiries)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(contactInquiries.id, id))
  }
}
