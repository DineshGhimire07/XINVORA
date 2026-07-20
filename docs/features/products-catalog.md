# Feature Documentation — Products & Catalog Engine

## Purpose
Manages product listings, color/size variants, price books, special promotional campaign sections, and real-time inventory indicators.

---

## Core Components
- `ProductCard.tsx`: Storefront card component rendering low-latency image overlays, compare-at strikethroughs, gold discount badges (`-33% OFF`), and wishlist hearts.
- `ProductVariantSelector.tsx`: Interactive size and color picker on Product Detail Pages. Sold-out sizes display a single diagonal cross line overlay.
- `NotifyMeButton.tsx`: Back-in-stock notification request button for out-of-stock sizes.

---

## Dual Pricing Engine
1. **Price Book Entries (`priceBookEntries`)**: Stores `price` and `compareAtPrice` per variant.
2. **Off Section Promotions (`productOffSection`)**: Overrides variant compare-at pricing during special promotional campaigns.

---

**Last Updated**: July 20, 2026
