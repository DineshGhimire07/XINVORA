# Feature Documentation — Cart & Checkout Engine

## Purpose
Handles shopping cart state, inline size swapping, discount calculations, and regional checkout for Nepal logistics.

---

## Core Components & Features
- `CartItem.tsx`: Renders cart item details, image thumbnails, inline size pills swapper, price strikethroughs, and percentage off badges.
- `CartSummary.tsx`: Subtotal, shipping estimates, tax calculations, and checkout buttons.
- `Nepal Logistics Routing`: Address form supports Nepal's 7 Provinces, 77 Districts, and Municipalities.

---

## Data Flow
```text
Add to Cart ➔ cart.actions.ts ➔ CartService ➔ CartRepository ➔ DB (User) or Cookie (Guest)
```

---

**Last Updated**: July 20, 2026
