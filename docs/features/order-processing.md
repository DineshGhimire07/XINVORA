# Feature Documentation — Order Processing & Fulfillment

## Purpose
Manages order placement, status pipelines, stock deductions, and invoice printing.

---

## Order Status Pipeline
1. `PENDING`: Initial status upon order creation.
2. `PROCESSING`: Order being packed in warehouse.
3. `SHIPPED`: Order handed over to local Nepal courier.
4. `DELIVERED`: Successfully delivered to customer.

---

## Key Files
- `src/services/order.service.ts`: Order business logic and inventory deduction.
- `src/app/(admin)/admin/orders/page.tsx`: Admin order management page.
- `src/app/(admin)/admin/orders/print/page.tsx`: Printable invoice and packing slip view.

---

**Last Updated**: July 20, 2026
