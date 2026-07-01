# CHANGELOG.md — XINVORA Project Changelog

> **This is a living document tracking progress milestones, releases, and phase completions.**
>
> Entries must be recorded in reverse chronological order (newest first).

---

## Releases & Phase Milestones

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

*   **v0.3.0 (Phase 2A Complete)**: Application core wrapper elements, loading layers, error handlers.
*   **v0.4.0 (Phase 2B Complete)**: Design token styles, CSS configurations, atomic buttons/inputs.
*   **v0.5.0 (Phase 2C Complete)**: Header, navigation structures, mobile drawers, breadcrumbs.
*   **v0.6.0 (Phase 2D Complete)**: Reusable Framer Motion transitions and spring physics profiles.
*   **v0.7.0 (Phase 3 Complete)**: Aspirational brand landing page, static marketing sections.

---

*XINVORA CHANGELOG.md — v1.0.0*
*Established: 2026*
