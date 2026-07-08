import type { CartResult } from "../db/queries/types"

export interface TaxResult {
  taxRate: number // basis points, e.g. 1300 = 13.00%
  taxAmount: number
}

export class TaxService {
  /**
   * Abstracted tax calculation engine.
   * Returns a rate in basis points and the calculated amount.
   * Future implementation: Use billing/shipping address to calculate VAT/GST/State Tax.
   */
  static async calculateTax(
    cart: CartResult,
    subtotal: number,
    shippingCost: number,
    country?: string
  ): Promise<TaxResult> {
    const rate = country ? 1000 : 0
    const taxAmount = Math.floor(subtotal * (rate / 10000))
    return { taxRate: rate, taxAmount }
  }

  /** Nepal VAT = 13% = 1300 basis points */
  static getDefaultRate(): number {
    return 0 // No tax for COD Nepal orders for now
  }

  static calculate(subtotal: number, rateBasisPoints: number): number {
    return Math.floor(subtotal * (rateBasisPoints / 10000))
  }
}

