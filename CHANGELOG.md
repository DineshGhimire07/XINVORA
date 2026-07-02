# CHANGELOG.md — XINVORA Project Changelog

> **This is a living document tracking progress milestones, releases, and phase completions.**
>
> Entries must be recorded in reverse chronological order (newest first).

---

## Releases & Phase Milestones

### v1.1.0 — 2026-07-02
*   **Phase 3F Complete: Journal & Editorial Experience Foundation**
    *   Created `src/app/journal/page.tsx` static landing index list.
    *   Created `src/app/journal/[slug]/page.tsx` dynamic article reading page template.
    *   Pre-compiled all 6 dynamic journal routes using `generateStaticParams` for instant transitions.
    *   Implemented featured story card block, horizontal categories navigation, and 3-column stories grid.
    *   Added pulled quotes and large media landscape blocks for long-form reading comfort.
    *   Added related story suggestions list and Dispatch signature footer.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v1.0.0 — 2026-07-02
*   **Phase 3E Complete: Brand Experience Foundation**
    *   Created `src/app/about/page.tsx` brand about page as a static pre-rendered Server Component.
    *   Implemented editorial hero, story columns, principles grid, raw materials details, craftsmanship, sustainability, timeline, and closing quote block.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.9.0 — 2026-07-02
*   **Phase 3D Complete: Product Detail Experience Foundation**
    *   Created dynamic product detail route `src/app/products/[slug]/page.tsx` as a pure, zero-hydration Server Component.
    *   Pre-rendered all 12 unique product slugs using `generateStaticParams` for instant static transitions.
    *   Implemented editorial split layout (7/12 visual gallery placeholder and 5/12 info panel) on desktop.
    *   Built variant button selectors for sizes and colors with default active selection highlights.
    *   Created stacked primary actions (`Add to Bag` and `Save for Later`) with design-system variant styling.
    *   Added detailed typography sections for composition, care instructions, and shipping guidelines.
    *   Created 4-column related products grid reusing the Phase 3C cards.
    *   Added recently viewed horizontal references navigation footer.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.8.0 — 2026-07-02
*   **Phase 3C Complete: Collections Experience Foundation**
    *   Created `src/app/collections/page.tsx` as a pure, zero-hydration Server Component.
    *   Implemented Collection Hero block with `max-w-[32rem]` text container reading width.
    *   Built responsive Category Navigation scrollbar flex bar.
    *   Added static Catalogue Toolbar count (`12 Objects`) and sorting/filtering placeholders.
    *   Created responsive Product Grid (Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column).
    *   Configured Product Cards with clean metadata details, omitting commercial pricing, ratings, or stock hooks.
    *   Added conditional Empty State blocks toggleable via URL parameter (`?empty=true`).
    *   Mapped standard numeric Pagination layouts.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.8 — 2026-07-02
*   **Phase 3B.7 Complete: Homepage Experience Review & Premium Refinement**
    *   Unified all root section containers on identical horizontal grid lines using `<Container size="site">` (default `<Container>`) to ensure absolute layout alignment.
    *   Redesigned the Hero Section to follow a premium 5 / 7 columns split layout (`cols={{ base: 1, md: 12 }}`) on tablet/desktop viewports and stack on mobile.
    *   Constrained content reading widths of text blocks and inputs strictly to `~28-34rem` (`max-w-[32rem]`) to improve editorial readability.
    *   Established an elegant, alternating background rhythm (`bg-surface-elevated` vs `bg-background`) between sections.
    *   Refined the Trust Section cards to let principles breathe using borderless stacks and wider gaps (`gap={12}`).
    *   Refined the Newsletter Section input form utilizing the existing `ghost` Input variant without mutating the design system `src/components/ui/input.tsx` file.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.7 — 2026-07-02
*   **Phase 3B.6 Complete: Homepage Newsletter**
    *   Surgically updated `NewsletterSection` inside `src/app/page.tsx` with a premium responsive email subscription form block under header name `Become part of the XINVORA community`.
    *   Composed layout layout components directly using design system primitives: `<Input>` and primary filled `<Button>` (Subscribe).
    *   Paired input with screen-reader-only labels (`sr-only`) to secure accessible landmark navigation.
    *   Enforced pure Server Component execution (zero client-side JS runtime weight, no hooks, no submission validation endpoints).
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.6 — 2026-07-02
*   **Phase 3B.5 Complete: Homepage Trust Section**
    *   Surgically updated `TrustSection` inside `src/app/page.tsx` with a premium responsive three-column grid layout under section name `The Values That Guide Us`.
    *   Eliminated operational commerce copy placeholders (shipping, checkouts, returns) in favor of brand philosophy values (thoughtful craftsmanship, organic/stoneware materials, restrained aesthetics).
    *   Leveraged spacing, layout typography, and clean margins inside design-token containers for visual structure without speculative icons.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.5 — 2026-07-02
*   **Phase 3B.4 Complete: Homepage Featured Products**
    *   Surgically updated `FeaturedProductsSection` inside `src/app/page.tsx` with a premium four-column grid layout under section name `Selected Pieces`.
    *   Substituted specific product labels with generic, decoupled edition stubs (`Edition 01` to `Edition 04`) and collection references.
    *   Abstracted pricing details completely to prevent currency and formatting assumptions ahead of Phase 4.
    *   Configured on-brand structural card surfaces with relative aspect ratio placeholders (`aspect-[3/4]`) and clean backgrounds.
    *   Escaped unescaped entities inside string tags to ensure ESLint compliance.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.4 — 2026-07-02
*   **Maintenance: Resolve Asset & Metadata Warnings**
    *   Fixed Next.js `Image` warning by replacing `fill` with explicit `width={48}` and `height={48}` dimensions for the square brand emblem.
    *   Disabled unused favicon and manifest paths in `src/lib/metadata.ts` to prevent 404 console errors during localhost load, deferring manifest configuration until Brand Assets are finalized.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.3 — 2026-07-02
*   **Phase 3B.3 Complete: Homepage Featured Categories**
    *   Surgically updated `FeaturedCategoriesSection` inside `src/app/page.tsx` with a premium responsive three-column collections grid.
    *   Substituted specific category labels with generic, decoupled collection stubs (`Collection I`, `Collection II`, `Collection III`).
    *   Configured on-brand structural card surfaces with relative aspect ratio placeholders.
    *   Enforced pure Server Component execution with zero client hooks or browser hydration code.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.2 — 2026-07-02
*   **Phase 3B.2 Complete: Homepage Brand Story**
    *   Surgically updated `BrandStorySection` inside `src/app/page.tsx` with a premium two-column responsive grid layout.
    *   Adapted core brand philosophy values (timeless style, design intentionality, restraint) from `VISION.md` into editorial copy.
    *   Integrated semantic heading structure mapping an uppercase eyebrow and `<h2>` titles.
    *   Enforced pure Server Component logic with zero hydration or client-side runtime JS weight.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.1 — 2026-07-02
*   **Phase 3B.1 Complete: Hero Section**
    *   Surgically updated `HeroSection` inside `src/app/page.tsx` with a premium, centered, spacious editorial layout.
    *   Composed visual-only primary and secondary CTA buttons utilizing existing `<Button>` primitives.
    *   Configured fluid typography breakpoints for visual responsive scaling across viewports.
    *   Enforced pure Server Component logic (no client hooks, zero dynamic hydration weight).
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.7.0 — 2026-07-02
*   **Phase 3A Complete: Homepage Foundation**
    *   Replaced the temporary foundation placeholder in `src/app/page.tsx` with the Homepage Layout structure.
    *   Composed the Homepage structural sections (Hero, Brand Story, Featured Categories, Featured Products, Trust, and Newsletter) using layout primitives.
    *   Reused layout wrappers `<Section>`, `<Container>`, `<Grid>`, and `<Stack>` to arrange columns and content groups, maintaining strict decoupled rules.
    *   Configured indexable homepage SEO metadata (custom description and default brand template title overrides).
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.6.0 — 2026-07-02
*   **Phase 2D Complete: Motion System Baseline**
    *   Established scroll animation structure placeholders and reset values aligned with the design token animation guidelines.

### v0.5.0 — 2026-07-02
*   **Phase 2C Complete: Navigation Baseline**
    *   Created `src/components/shared/skip-to-content.tsx` accessibility bypass link.
    *   Mapped structural placeholders for Header and mobile-drawer layout boundaries.

### v0.4.0 — 2026-07-02
*   **Phase 2B Complete: Design System Primitives**
    *   Created `spinner.tsx` — Accessible SVG spinner using custom size tokens (`xs`, `sm`, `md`, `lg`) and CSS class merges.
    *   Created `skeleton.tsx` — Layout container utilizing global CSS shimmer effect for content loading placeholders.
    *   Created `badge.tsx` — Visual tag styling supporting state colors and typography sizes.
    *   Created `separator.tsx` — Decoupled horizontal and vertical visual separators with custom aria settings.
    *   Created `label.tsx` — Accessible visual metadata form labels matching project states.
    *   Created `textarea.tsx` — Client Component form text block with support for multiline input and resizing constraints.
    *   Created layout primitives: `stack.tsx` (Flexbox layouts), `grid.tsx` (Responsive columns), `container.tsx` (Width-constrained panels), and `section.tsx` (Vertical block padding).
    *   Enforced architecture constraints: decoupled `Section` and `Container` layouts, deferred `typography.tsx` component and Button loading transitions per approved specs.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.3.0 — 2026-07-01
*   **Phase 2A Complete: Core Application Shell**
    *   Created `src/app/error.tsx` — Client Component error boundary with branded recovery UI, dev-only logging, `role="alert"`, and `reset()` integration.
    *   Created `src/app/loading.tsx` — Server Component loading state with brand-aligned shimmer indicator and full accessibility (`role="status"`, `aria-label`, `sr-only`).
    *   Added `@keyframes shimmer` definition to `globals.css` — fixes the `.shimmer` utility class which previously had no backing keyframe.
    *   Added `env(safe-area-inset-*)` padding to `html {}` in `globals.css` for iOS notch and home-indicator device support.
    *   Added `.text-code` monospace typography class to `globals.css`, completing the full type scale.
    *   Updated `PROMPT_TEMPLATE.md` to v2.0.0 with the 9-step disciplined workflow: Read → Audit → Change Impact → Approval → Code → Quality Gate → Repository Health → Docs → Commit.
    *   Quality Gate: `lint` ✅ `tsc --noEmit` ✅ `build` ✅ — zero errors, zero warnings.

### v0.2.0 — 2026-07-01
*   **Phase 1 Complete: Project Foundation Established**
    *   Scaffolded complete directory architecture (per `ARCHITECTURE.md`) including services, prisma, features, and components.
    *   Configured typescript compilation path aliases (`@/*`) and verified absolute imports work correctly.
    *   Configured project-specific linter rules for ESLint, Prettier, and resolved all initialization warnings/errors.
    *   Refactored `useMediaQuery` and `useReducedMotion` hooks using `useSyncExternalStore` for clean, hydration-safe code.
    *   Created core helper utilities including custom class merger `cn.ts`, central constant re-exports `constants.ts`, and environment wrappers `env.ts`.
    *   Verified Next.js 16.2.9 Turbopack builds with zero warnings or errors.

### v0.1.0 — 2026-06-30
*   **Documentation Baseline Established**
    *   Created permanent repository foundation files (`README.md`, `AI_RULES.md`, `ARCHITECTURE.md`, `BRAND_GUIDELINES.md`).
    *   Created development lifecycle tracking files (`DEVELOPMENT_WORKFLOW.md`, `PROJECT_STATUS.md`).
    *   Created decision records (`DECISIONS.md`) and standard session prompt controls (`PROMPT_TEMPLATE.md`).
    *   Configured folder hierarchies and naming conventions.

---

## Future Deliverables (Roadmap Stubs)

*   **v0.8.0 (Phase 3B Complete)**: Homepage content, editorial copies, static featured grids, and visual media placements.
*   **v0.9.0 (Phase 2C.2 Complete)**: Full desktop header navigation and mobile menu drawer triggers.

---

*XINVORA CHANGELOG.md — v1.0.0*
*Established: 2026*
