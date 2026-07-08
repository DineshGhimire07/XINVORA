import { randomBytes } from "crypto"

export class OrderNumberService {
  /**
   * Generates a safe order number: XINV-YYYY-[HEX]
   * e.g., XINV-2026-AB12CD34
   */
  static generateOrderNumber(): string {
    const year = new Date().getFullYear()
    const suffix = randomBytes(4).toString("hex").toUpperCase() // 8 chars
    return `XINV-${year}-${suffix}`
  }

  static async generate(): Promise<string> {
    return OrderNumberService.generateOrderNumber()
  }
}
