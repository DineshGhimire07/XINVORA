import { getCart } from "../db/queries/cart"
import { getCouponByCode } from "../db/queries/checkout"
import { ShippingService } from "./shipping.service"
// import { TaxService } from "./tax.service"
import { OrderNumberService } from "./order-number.service"
import { CheckoutRepository } from "../db/repositories/checkout.repository"
import type { CheckoutSubmission } from "../validations/checkout"
import { PricingService } from "./pricing.service"

export class CheckoutService {
  /**
   * Calculates all totals for a given cart, shipping method, and optional coupon.
   * Runs outside transactions for checkout preview and order summary UI.
   */
  static async calculateTotals(userId: string, submission: CheckoutSubmission) {
    const cart = await getCart(userId, null)
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty")
    }

    let subtotal = 0
    for (const item of cart.items) {
      subtotal += item.price * item.quantity
    }

    let discountAmount = 0
    let couponRecord = null

    if (submission.couponCode) {
      const coupon = await getCouponByCode(submission.couponCode)
      
      // Validation Order Refinements:
      // 1. Exists
      if (!coupon) {
        throw new Error("Coupon does not exist")
      }
      couponRecord = coupon

      // 2. Active
      if (!coupon.isActive) {
        throw new Error("Coupon is inactive")
      }
      // 3. Not deleted
      if (coupon.deletedAt) {
        throw new Error("Coupon has been deleted")
      }
      // 4. Date validation: StartsAt
      const now = new Date()
      if (coupon.startsAt && now < coupon.startsAt) {
        throw new Error("Coupon is not active yet")
      }
      // 5. Date validation: ExpiresAt
      if (coupon.expiresAt && now > coupon.expiresAt) {
        throw new Error("Coupon has expired")
      }
      // 6. Minimum order reached
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount of $${(coupon.minOrderAmount / 100).toFixed(2)} not met`)
      }
      // 7. Global max uses not exceeded
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        throw new Error("Coupon global usage limit exceeded")
      }
      // 8. User max uses not exceeded
      if (coupon.usesPerUser) {
        // Query using CheckoutRepository outside transaction context
        const userUses = await CheckoutRepository.countUserCouponUses(null, userId, coupon.id)
        if (userUses >= coupon.usesPerUser) {
          throw new Error("Coupon personal usage limit exceeded")
        }
      }
      // 9. Applicable category/product
      if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
        const hasQualifyingProduct = cart.items.some(item => 
          (coupon.applicableProducts as string[]).includes(item.variant.product.id)
        )
        if (!hasQualifyingProduct) {
          throw new Error("Coupon is not applicable to any products in the cart")
        }
      }
      if (coupon.applicableCategories && Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0) {
        const hasQualifyingCategory = cart.items.some(item => 
          item.variant.product.categoryId && (coupon.applicableCategories as string[]).includes(item.variant.product.categoryId)
        )
        if (!hasQualifyingCategory) {
          throw new Error("Coupon is not applicable to any categories in the cart")
        }
      }

      // Apply discount
      discountAmount = PricingService.calculateDiscountAmount(coupon, subtotal)
    }

    // Ensure we never discount below 0 subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal
    }

    const shippingMethod = await ShippingService.getShippingMethodById(submission.shippingMethodId)
    if (!shippingMethod) {
      throw new Error("Invalid shipping method")
    }

    // Tiered shipping logic moved to PricingService
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const shippingCost = PricingService.calculateTieredShipping(totalItems)

    // Tax disabled — business below VAT threshold as of July 2026. 
    // Re-enable TaxService calls here if registration status changes.
    // const taxResult = await TaxService.calculateTax(cart, subtotal, shippingCost, "Nepal")
    
    const total = subtotal - discountAmount + shippingCost // + taxResult.taxAmount

    return {
      cart,
      subtotal,
      discountAmount,
      shippingMethod,
      shippingCost,
      taxRate: 0, // taxResult.taxRate,
      taxAmount: 0, // taxResult.taxAmount,
      total,
      couponRecord,
    }
  }

  /**
   * Core Transaction Engine to convert Cart -> Order.
   * Completely decoupled from database driver/Drizzle imports.
   */
  static async createOrder(userId: string, submission: CheckoutSubmission) {
    const orderNumber = OrderNumberService.generateOrderNumber()

    // 1. Fetch initial cart outside transaction to know what items the user intended to buy
    const initialCart = await getCart(userId, null)
    if (!initialCart || initialCart.items.length === 0) {
      throw new Error("Cart is empty")
    }

    // Delegate transaction execution to the repository layer
    const orderResult = await CheckoutRepository.executeTransaction(async (tx) => {
      // 2. Lock inventory for all items in the initial cart
      for (let i = 0; i < initialCart.items.length; i++) {
        const item = initialCart.items[i]
        const success = await CheckoutRepository.reserveInventory(tx, item.variant.id, item.quantity)
        if (!success) {
          throw new Error(`Out of Stock: ${item.variant.product.name} (SKU: ${item.variant.sku})`)
        }
      }

      // 3. Lock coupon (if provided)
      let couponId: string | null = null
      if (submission.couponCode) {
        const lockedCoupon = await CheckoutRepository.lockCoupon(tx, submission.couponCode)
        if (!lockedCoupon) {
          throw new Error("Coupon does not exist")
        }
        couponId = lockedCoupon.id
      }

      // 4. Recalculate totals INSIDE transaction with locks held
      // This re-fetches the cart, meaning it reads the CURRENT prices and stock (which we now hold locks on)
      const totals = await this.calculateTotals(userId, submission)

      // 5. Detect mismatches (prices changed between the user clicking checkout and the lock being acquired)
      for (const currentItem of totals.cart.items) {
        const initialItem = initialCart.items.find(i => i.variant.id === currentItem.variant.id)
        if (!initialItem || initialItem.price !== currentItem.price || initialItem.quantity !== currentItem.quantity) {
          throw new Error("Prices have changed, please review your cart")
        }
      }
      if (totals.cart.items.length !== initialCart.items.length) {
        throw new Error("Cart items have changed, please review your cart")
      }

      // 5.5 Save user address if requested (inside transaction so it rolls back on failure)
      if (submission.saveAddress) {
        await CheckoutRepository.saveAddress(tx, userId, {
          fullName: submission.fullName,
          phone: submission.phone,
          provinceId: submission.provinceId,
          districtId: submission.districtId,
          municipalityId: submission.municipalityId,
          wardNumber: submission.wardNumber,
          tole: submission.tole,
          street: submission.street || null,
          landmark: submission.landmark || null,
          deliveryNote: submission.deliveryNote || null,
          latitude: submission.latitude || null,
          longitude: submission.longitude || null,
        })
      }

      // 6. Create Order Snapshot
      const addressSnapshot = {
        fullName: submission.fullName,
        phone: submission.phone,
        provinceId: submission.provinceId,
        districtId: submission.districtId,
        municipalityId: submission.municipalityId,
        wardNumber: submission.wardNumber,
        tole: submission.tole,
        street: submission.street || null,
        landmark: submission.landmark || null,
        deliveryNote: submission.deliveryNote || null,
        latitude: submission.latitude || null,
        longitude: submission.longitude || null,
        provinceName: submission.provinceName || null,
        districtName: submission.districtName || null,
        municipalityName: submission.municipalityName || null,
        municipalityType: submission.municipalityType || null,
        country: "Nepal",
      }

      const paymentProvider = submission.paymentMethod === "COD" 
        ? "MANUAL" 
        : submission.paymentMethod === "ESEWA" 
        ? "ESEWA" 
        : "NONE"

      const days = parseInt(totals.shippingMethod.estimatedDays) || 5
      const estimatedDelivery = new Date()
      estimatedDelivery.setDate(estimatedDelivery.getDate() + days)

      const finalTotal = totals.subtotal - totals.discountAmount + totals.shippingCost + totals.taxAmount

      const orderStatus = submission.paymentMethod === "ESEWA" ? "PAYMENT_PENDING_VERIFICATION" : "CONFIRMED"

      const newOrder = await CheckoutRepository.createOrder(tx, {
        orderNumber,
        userId,
        status: orderStatus as any,
        paymentStatus: "PENDING" as const,
        paymentMethod: submission.paymentMethod,
        idempotencyKey: submission.idempotencyKey || null,
        shippingAddress: addressSnapshot,
        billingAddress: addressSnapshot,
        subtotal: totals.subtotal,
        shippingMethod: totals.shippingMethod.name,
        shippingCost: totals.shippingCost,
        estimatedDelivery,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        couponId,
        total: finalTotal,
        currency: "NPR" as const,
        paymentProvider,
        paymentProofUrl: submission.paymentProofUrl || null,
        notes: [
          submission.couponCode ? `Applied coupon: ${submission.couponCode}` : null,
          submission.deliveryNote ? `Note: ${submission.deliveryNote}` : null
        ].filter(Boolean).join(" | ") || null,
      })

      // 7. Create Order Items
      const orderItemsToInsert = []
      let accumulatedDiscount = 0
      let accumulatedTax = 0
      
      for (let i = 0; i < totals.cart.items.length; i++) {
        const item = totals.cart.items[i]
        const isLastItem = i === totals.cart.items.length - 1
        
        let itemDiscount = 0
        if (totals.discountAmount > 0) {
          if (isLastItem) {
            itemDiscount = totals.discountAmount - accumulatedDiscount
          } else {
            itemDiscount = Math.floor(totals.discountAmount * ((item.price * item.quantity) / totals.subtotal))
            accumulatedDiscount += itemDiscount
          }
        }

        let itemTax = 0
        if (totals.taxAmount > 0) {
          if (isLastItem) {
            itemTax = totals.taxAmount - accumulatedTax
          } else {
            itemTax = Math.floor(totals.taxAmount * ((item.price * item.quantity) / totals.subtotal))
            accumulatedTax += itemTax
          }
        }

        orderItemsToInsert.push({
          orderId: newOrder.id,
          variantId: item.variant.id,
          productName: item.variant.product.name,
          sku: item.variant.sku,
          variantOptions: {
            color: item.variant.color?.name,
            size: item.variant.size?.name,
          },
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          currency: "NPR" as const,
          discountApplied: itemDiscount,
          taxApplied: itemTax,
        })
      }

      await CheckoutRepository.createOrderItems(tx, orderItemsToInsert)

      // 8. Increment Coupon Usage
      if (couponId) {
        await CheckoutRepository.incrementCouponUses(tx, couponId)
      }

      // 9. Clear Cart
      await CheckoutRepository.clearCartItems(tx, totals.cart.id)

      return newOrder.id
    })

    return { orderId: orderResult, orderNumber }
  }

}
