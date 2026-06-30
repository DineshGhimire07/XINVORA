# AI_RULES.md — XINVORA Engineering Rules for AI Agents

> **This is the most important document in the repository.**
>
> Every AI agent, language model, or automated tool that generates, modifies, or reviews code for XINVORA **must read and follow every rule in this document before taking any action.**
>
> These rules exist to protect the integrity, consistency, and quality of the XINVORA codebase. Violations create technical debt, regressions, and brand damage. There are no exceptions unless explicitly overridden by a human engineering lead in writing.
>
> **DOCUMENTATION STATE: FROZEN. DO NOT EDIT.**

---

## Table of Contents

1. [Critical AI Execution Rules](#1-critical-ai-execution-rules)
2. [Architecture Rules](#2-architecture-rules)
3. [File and Folder Rules](#3-file-and-folder-rules)
4. [Component Rules](#4-component-rules)
5. [Styling and Design Token Rules](#5-styling-and-design-token-rules)
6. [TypeScript Rules](#6-typescript-rules)
7. [Phase and Scope Rules](#7-phase-and-scope-rules)
8. [State Management Rules](#8-state-management-rules)
9. [API and Service Rules](#9-api-and-service-rules)
10. [Performance Rules](#10-performance-rules)
11. [Accessibility Rules](#11-accessibility-rules)
12. [Git and Change Management Rules](#12-git-and-change-management-rules)
13. [Documentation Rules](#13-documentation-rules)
14. [Communication Rules](#14-communication-rules)

---

## 1. Critical AI Execution Rules

### RULE-AI-01: Never rewrite an entire file
Never rewrite an entire working file unless the user explicitly requests a full rewrite in plain, unambiguous language. Always prefer highly targeted, surgical edits to modify code blocks. This prevents AI-generated regressions, formatting resets, and loss of custom logic.

---

## 2. Architecture Rules

### RULE-ARCH-01: Never reorganize the folder structure
The folder structure defined in ARCHITECTURE.md is the permanent architecture of this project. You must never rename, move, merge, or delete folders unless explicitly instructed by the engineering lead in writing. Reorganizing folders breaks imports, team conventions, and AI context.

### RULE-ARCH-02: Never introduce new top-level folders
All new code belongs within the existing top-level folders defined in ARCHITECTURE.md. If you believe a new top-level folder is needed, stop and ask. Do not create it unilaterally.

### RULE-ARCH-03: Never change the architecture to solve a small problem
If a component has a minor bug, fix the component. Do not restructure the architecture around it. Use the smallest possible change that solves the problem.

### RULE-ARCH-04: Always co-locate feature code inside feature folders
Feature-specific components, hooks, types, utilities, and API logic belong inside the corresponding `features/<feature-name>/` folder. Do not scatter feature code across unrelated folders.

### RULE-ARCH-05: Never bypass the service layer
External services must only be accessed through wrappers in `services/`. Components and Route Handlers must never call external SDKs or clients directly. The service layer is the contract.

### RULE-ARCH-06: Always respect the Server/Client component boundary
A component is a Server Component by default. The `'use client'` directive is added only when the component requires browser APIs, React hooks that depend on browser state, or user interactivity. Never add `'use client'` out of convenience or habit.

### RULE-ARCH-07: Never create circular dependencies
Every module must have a clear, single direction of dependency. Features depend on `lib/`, `services/`, `hooks/`, `types/`. Features never depend on other features unless explicitly architected that way.

---

## 3. File and Folder Rules

### RULE-FILE-01: Never rename existing files
Renaming a file breaks imports throughout the codebase, breaks git history attribution, and breaks any external documentation that references the file. If a file's purpose has changed, document the change but keep the filename.

### RULE-FILE-02: Never delete existing files without explicit instruction
Deleting a file may remove functionality that other parts of the system depend on, even if those dependencies are not immediately visible. Always confirm before deleting.

### RULE-FILE-03: Never regenerate a working file from scratch
If a file exists and is working, do not replace its contents entirely. Edit only the specific lines or sections that require modification. Regenerating an entire file discards intentional decisions, comments, and formatting.

### RULE-FILE-04: Never duplicate files or components
Before creating any new component, hook, utility, or type, search the codebase for an existing implementation. If one exists, extend or reuse it. Duplication is never acceptable.

### RULE-FILE-05: Always place new files in the correct folder as defined in ARCHITECTURE.md
Read ARCHITECTURE.md before creating any new file. Placing files in wrong folders creates confusion and defeats the purpose of the architecture.

### RULE-FILE-06: Never create index barrel files speculatively
Barrel files (`index.ts`) that re-export many modules can cause large bundle sizes and circular dependency risks. Only create barrel files when explicitly instructed.

### RULE-FILE-07: File names must follow the established naming convention
- React components: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase prefixed with `use` (`useCartState.ts`)
- Utilities: camelCase (`formatCurrency.ts`)
- Types: PascalCase (`ProductType.ts`)
- API routes: kebab-case directories (`/api/product-details/route.ts`)
- Constants: SCREAMING_SNAKE_CASE inside files, camelCase filenames (`brandConstants.ts`)

---

## 4. Component Rules

### RULE-COMP-01: Never hardcode content strings inside components
User-visible strings (labels, headings, messages, error text) must be defined as named constants or passed as props — never typed inline. This enables future localization.

### RULE-COMP-02: Never create a component that does more than one thing
Each component has one responsibility. A `ProductCard` renders a product card. It does not also handle cart logic. It does not also manage its own fetching. Single responsibility makes components reusable and testable.

### RULE-COMP-03: Never write inline styles
Styles are expressed via Tailwind utility classes or CSS Custom Properties from the design token system. Inline `style={{ }}` attributes are forbidden except for dynamic values that cannot be expressed any other way (e.g., dynamic animation keyframe values).

### RULE-COMP-04: Never write component-level media queries that override the design system
Responsive behavior must use the Tailwind responsive prefix system (`sm:`, `md:`, `lg:`, `xl:`). Custom media queries inside component CSS override the design system and create inconsistency.

### RULE-COMP-05: Always define prop types with TypeScript interfaces
Every component must have an explicit TypeScript interface for its props. No props may be typed as `any` or left untyped.

### RULE-COMP-06: Always provide default values for optional props
Optional props must have sensible default values so that components render correctly in isolation without requiring every prop to be provided.

### RULE-COMP-07: Never add logic to UI components
UI components (`components/ui/`) are pure presentation. They render markup and apply styles. They do not fetch data, call APIs, manage complex state, or contain business logic. Logic lives in features, services, or hooks.

### RULE-COMP-08: Never create a component that is only used once and is trivially small
If a component is a single `<div>` wrapper with a class name used only once, it does not need to be a component. Premature componentization adds cognitive overhead without benefit.

---

## 5. Styling and Design Token Rules

### RULE-STYLE-01: Never hardcode color values
Colors are never expressed as hex codes, RGB values, HSL values, or named CSS colors in component code. All colors reference design token CSS custom properties (e.g., `var(--color-brand-primary)`). This rule has zero exceptions.

### RULE-STYLE-02: Never hardcode spacing values
Spacing values are never expressed as raw pixel or rem values in component code. All spacing uses Tailwind's spacing scale (which maps to the design token system) or CSS custom properties.

### RULE-STYLE-03: Never hardcode font size values
Typography sizes are always referenced from the design token system or Tailwind's type scale. Raw font size values in component code are forbidden.

### RULE-STYLE-04: Never hardcode animation duration values
All animation durations and easing functions are defined in the design token system and referenced by name. Components never define `transition: all 0.3s ease` with raw values.

### RULE-STYLE-05: Never modify the design token system without explicit instruction
The design tokens are the single source of truth for the entire visual language of XINVORA. Modifying them changes the appearance of every component that uses them. This requires explicit sign-off.

### RULE-STYLE-06: Never use arbitrary Tailwind values for brand-significant properties
Tailwind's arbitrary value syntax (`bg-[#ff0000]`) is forbidden for colors, typography, and spacing that are part of the brand identity. Use the token system.

### RULE-STYLE-07: Always prefer composing existing utility classes over writing new CSS
Before writing custom CSS, verify that the desired result cannot be achieved with existing Tailwind utilities or design token combinations. Custom CSS increases maintenance surface.

### RULE-STYLE-08: Dark mode must always be supported
Every component and every color token must have a dark mode variant defined. Light-mode-only implementations are never acceptable.

---

## 6. TypeScript Rules

### RULE-TS-01: Never use `any`
The `any` type defeats the entire purpose of TypeScript. It is forbidden without a written, commented justification and explicit approval. Use `unknown`, proper generics, or well-typed interfaces instead.

### RULE-TS-02: Never use non-null assertion (`!`) without a comment
The non-null assertion operator (`!`) bypasses null safety. If you use it, you must add a comment directly above it explaining exactly why you know the value cannot be null at that point.

### RULE-TS-03: Never use `@ts-ignore` or `@ts-nocheck`
These directives suppress TypeScript errors instead of fixing them. They are forbidden. Fix the type error properly.

### RULE-TS-04: Always define explicit return types for functions
Functions that return non-trivial types must have explicit return type annotations. TypeScript inference is helpful for simple cases, but explicit types are required for service functions, API handlers, and hooks.

### RULE-TS-05: Never use `enum` — use `as const` objects instead
TypeScript enums have surprising runtime behavior and bundle implications. Use `as const` objects with a derived type union for all enum-like structures.

### RULE-TS-06: Always define Zod schemas for all API inputs
Every API Route Handler that accepts a request body must validate that body against a Zod schema before processing. Never trust raw request data.

### RULE-TS-07: Always co-locate types with the code they describe
Types for a feature belong in `features/<feature>/types.ts`. Types shared across multiple features belong in `types/`. Types must never be defined inside component files.

---

## 7. Phase and Scope Rules

### RULE-PHASE-01: Never build code for a future phase
Every phase has a defined scope in DEVELOPMENT_WORKFLOW.md. You must not write code, create files, or introduce abstractions that belong to a future phase. Building ahead creates confusion, untested dead code, and architectural drift.

### RULE-PHASE-02: Never skip a phase
Phases are ordered because they have dependencies. Phase 2B (Design System) must be complete before Phase 2C (Navigation). Phase 3 (Landing Page) cannot be started before the design system exists. The sequence is non-negotiable.

### RULE-PHASE-03: Never partially complete a phase and declare it done
A phase is complete only when every checklist item in PROJECT_STATUS.md has been checked off and verified. Partial completion is not completion.

### RULE-PHASE-04: Never modify Phase N-1 deliverables while working on Phase N
Once a phase is marked complete, its output files are locked. If a bug is discovered in a prior phase during a later phase, it must be fixed as a separate, explicitly scoped task — not silently modified.

### RULE-PHASE-05: Always read PROJECT_STATUS.md before starting any work
Before generating any code, read PROJECT_STATUS.md to understand what phase is active, what has been completed, and what the immediate next objective is.

### RULE-PHASE-06: Never introduce production-only dependencies during development phases
Dependencies required only for production (CDN configuration, monitoring agents, analytics scripts) must not be introduced during feature development phases. They belong in Phase 15 (Deployment).

---

## 8. State Management Rules

### RULE-STATE-01: Never use server state management for UI state
Server state (data fetched from the API) is managed by TanStack Query. UI state (modals open, selected tabs, animation triggers) is managed by Zustand or local React state. These are never mixed.

### RULE-STATE-02: Never store derived data in state
If a value can be computed from existing state or props, it must be computed — not stored. Storing derived data creates synchronization bugs.

### RULE-STATE-03: Never use React Context for high-frequency state
React Context re-renders every subscriber on every update. It is suitable for low-frequency, global data (theme, auth user, locale). High-frequency state must use Zustand.

### RULE-STATE-04: Never put business logic inside Zustand stores
Zustand stores hold state and define actions. Business logic (calculating totals, applying discount rules, validating inventory) belongs in service functions or utility functions that are called by store actions.

---

## 9. API and Service Rules

### RULE-API-01: Never expose database IDs directly in public API responses
Public-facing API responses must never return raw database primary keys (auto-increment integers or sequential IDs). Use UUIDs or slugs for public-facing identifiers.

### RULE-API-02: Never return unfiltered database objects from APIs
Never return the raw Prisma model object to the client. Always transform API responses to return only the fields that the client needs. This prevents accidental data leakage.

### RULE-API-03: Always validate API inputs with Zod
Every API route that accepts a body, query parameter, or path parameter must validate inputs with a Zod schema before any business logic executes.

### RULE-API-04: Always handle API errors with consistent structure
All API errors must return a consistent JSON structure: `{ success: false, error: { code: string, message: string } }`. Never return raw error messages or stack traces to the client.

### RULE-API-05: Never call database access client directly from a Route Handler
Route Handlers call service functions. Service functions call database layers. This separation ensures business logic is testable and reusable without HTTP context.

### RULE-API-06: Never store secrets in code
API keys, database URLs, webhook secrets, and all other credentials must live in environment variables. Any hardcoded credential — even for development — is a critical security violation.

---

## 10. Performance Rules

### RULE-PERF-01: Never use `useEffect` to fetch data
Data fetching is handled by TanStack Query on the client side and by async Server Components on the server side. `useEffect` for data fetching creates race conditions, loading state bugs, and bypasses caching.

### RULE-PERF-02: Never use unoptimized images
All images must use the application framework's optimized Image component. Raw `<img>` tags are forbidden in application code. The optimized component provides automatic optimization, lazy loading, and responsive sizing.

### RULE-PERF-03: Never import an entire library when only one function is needed
Tree-shaking is critical for bundle size. Always use named imports (`import { format } from 'date-fns'`), never default imports of entire libraries.

### RULE-PERF-04: Always define image dimensions
Every optimized image component must have width and height props defined, or use layout fills with a sized container. Undefined image dimensions cause Cumulative Layout Shift (CLS) and hurt Core Web Vitals.

### RULE-PERF-05: Never block the main thread with synchronous heavy computation
Heavy computations must be deferred with `requestIdleCallback`, offloaded to Web Workers, or moved to the server. The main thread must remain free for user interactions.

---

## 11. Accessibility Rules

### RULE-A11Y-01: Every interactive element must be keyboard accessible
Buttons, links, form elements, modals, dropdowns, and custom interactive components must be fully operable by keyboard. Tab order, focus management, and Enter/Space/Escape key handling must be implemented.

### RULE-A11Y-02: Every image must have meaningful alt text
All Image components must have descriptive alt text that conveys the meaning of the image to screen reader users. Decorative images must use `alt=""`.

### RULE-A11Y-03: Every form field must have an associated label
Form inputs must be associated with a visible `<label>` or an `aria-label`. Placeholder text is not a substitute for a label.

### RULE-A11Y-04: Color must not be the only means of conveying information
Error states, success states, and status indicators must use text labels or icons in addition to color. Color-blind users must be able to understand the UI without relying on color alone.

### RULE-A11Y-05: All color combinations must meet WCAG 2.1 AA contrast ratio
Text on background must meet minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text. This applies to all brand colors, UI states, and dynamic content.

---

## 12. Git and Change Management Rules

### RULE-GIT-01: Every change must have a clear, single purpose
A single commit or change set must do one thing. Do not mix a bug fix with a refactor with a new feature in a single change. If changes are unrelated, they must be separate.

### RULE-GIT-02: Never reformat code unrelated to your task
If you are fixing a bug in a component, do not also reformat the entire file, sort imports, or rename variables in lines unrelated to the fix. Unrelated changes pollute diffs and make code review impossible.

### RULE-GIT-03: Always explain why a file was modified, not just what was changed
When modifying any file, document the reason for the change — not just what was changed. Comments, PR descriptions, and commit messages must answer "why."

---

## 13. Documentation Rules

### RULE-DOC-01: Always update PROJECT_STATUS.md when a phase milestone is completed
Every time a phase milestone or checklist item is completed, PROJECT_STATUS.md must be updated immediately. Stale status documentation is worse than no documentation.

### RULE-DOC-02: Never remove existing documentation comments from code
Existing JSDoc comments, inline explanations, and architectural decision notes must be preserved unless they are factually incorrect after a change. Documentation is part of the code.

### RULE-DOC-03: All new public functions must have JSDoc comments
Every exported function, hook, and service method must have a JSDoc comment that describes its purpose, parameters, and return value.

### RULE-DOC-04: Never assume documentation is optional
If you are unsure whether something needs documentation, document it. The cost of over-documentation is low. The cost of under-documentation is a future engineer spending hours understanding intent.

---

## 14. Communication Rules

### RULE-COMM-01: Never assume — always ask
If a requirement is ambiguous, a file path is unclear, a design decision is unspecified, or a behavior is undefined — stop and ask. Do not guess. Assumptions made by AI agents are a primary source of bugs, regressions, and technical debt in this project.

### RULE-COMM-02: Never silently change behavior
If a modification changes the observable behavior of the application — even as a side effect — that change must be explicitly documented in the response. No silent behavior changes.

### RULE-COMM-03: Always state which phase you are operating in
Every code generation response must begin by stating the current active phase, as read from PROJECT_STATUS.md. This ensures scope alignment.

### RULE-COMM-04: Always list every file you will create or modify before making changes
Before generating or modifying any code, list every file that will be touched and explain why. This gives the human engineer the opportunity to redirect before changes are made.

### RULE-COMM-05: If you discover a bug in a prior phase, report it — do not fix it silently
Bugs discovered in completed phases must be reported clearly. They may be fixed only as an explicitly scoped, approved task. Never silently fix prior phase code while working on the current phase.

### RULE-COMM-06: Never claim a task is complete unless every checklist item is verified
Do not mark a phase or task as complete unless every defined acceptance criterion has been met and verified. Aspirational completion claims cause downstream failures.

---

## Enforcement

These rules are not suggestions. They are the engineering constitution of XINVORA.

Any AI agent that violates these rules:
1. Must stop immediately when the violation is identified.
2. Must revert the violating changes.
3. Must explain what rule was violated and why.
4. Must propose a compliant alternative.

The human engineering lead has final authority to grant exceptions. Exceptions must be documented with a rationale directly in the affected file.

---

*XINVORA AI_RULES.md — v1.1.0*
*Total Rules: 57*
*Established: 2026*
