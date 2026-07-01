# CHANGELOG.md — XINVORA Project Changelog

> **This is a living document tracking progress milestones, releases, and phase completions.**
>
> Entries must be recorded in reverse chronological order (newest first).

---

## Releases & Phase Milestones

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
