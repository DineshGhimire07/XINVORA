# Business Logic & Pricing Rules Guide

This document defines the business rules governing pricing, discounts, stock, and orders across XINVORA.

---

## 1. Pricing & Discount Hierarchy
XINVORA supports two forms of product discounts:

1. **Compare-At Price (Regular Sale)**:
   - Entered on the product variant level.
   - Example: Regular price `NPR 15,000`, Compare-at `NPR 18,000` ➔ Renders `-17% OFF` badge and strikethrough price.

2. **Off Section Promotions (Special Campaign)**:
   - Created in Admin under `/admin/off-section`.
   - Takes priority over standard compare-at pricing.
   - Example: Special promotion sets selling price to `NPR 12,500` ➔ Renders campaign discount badge.

---

## 2. Inventory Rules
- **Live Stock Tracking**: Every product variant (e.g. Black Dress - Size M) tracks quantity.
- **Sold Out Indicator**: When stock is `0`:
  - Size button shows a single diagonal cross line overlay.
  - Clicking a sold-out variant disables "Add to Cart" and displays a "Notify Me When Available" button.

---

## 3. Shipping Calculation (Nepal Logistics)
- **Province & District Routing**:
  - Shipping rates and delivery estimates are routed by Nepal's 7 Provinces and 77 Districts.
  - Kathmandu Valley orders qualify for express 24-hour delivery options.
- **Free Shipping Threshold**: Orders over the configured minimum amount qualify for free shipping automatically at checkout.

---

## 4. Coupon Code Logic
- **Validation Rules**:
  - Code must be active and within start/end dates.
  - Minimum purchase subtotal requirement must be satisfied.
  - Single-use or total usage limit constraints are enforced.

---

**Last Updated**: July 20, 2026
