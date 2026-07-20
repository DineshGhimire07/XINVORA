# PROMPT_TEMPLATE.md — XINVORA AI Session Prompt Template

> **This template must head every future coding session prompt.**
>
> Copy this template to a new prompt block and fill out the bracketed sections before providing the instruction to the coding assistant.
>
> **DOCUMENTATION STATE: FROZEN. DO NOT EDIT WITHOUT VERSION BUMP.**

---

```markdown
# XINVORA System Context & Instruction

## Step 1 — Read Documentation

Read and parse ALL of the following documentation before generating any code or modifying any files:

- AI_RULES.md
- ARCHITECTURE.md
- PROJECT_STATUS.md
- BRAND_GUIDELINES.md
- DEVELOPMENT_WORKFLOW.md
- PROMPT_TEMPLATE.md (this file)

Do NOT proceed until every document above has been fully read.

## Step 2 — Repository Audit

Before producing a single line of code, audit the repository and identify:

- Every file that will be CREATED
- Every file that will be MODIFIED
- Every file that will be DELETED
- Any breaking changes introduced
- Any changes to architecture patterns
- Any changes to the folder structure
- Any documentation that must be updated

## Step 3 — Change Impact Assessment

Produce a Change Impact Assessment in the following format and include it in your response before any code:

---
### Change Impact Assessment

| Field | Value |
|---|---|
| **Files Created** | [N] |
| **Files Modified** | [N] |
| **Files Deleted** | [N] |
| **Breaking Changes** | None / [describe] |
| **Architecture Changes** | None / [describe] |
| **Documentation Changes** | [list files] |
| **Risk Level** | Low / Medium / High |
| **Rollback** | [describe how to revert if needed] |
---

## Step 4 — Wait for Human Approval

STOP after producing the Change Impact Assessment.

Do NOT generate code.

Wait for the human to explicitly approve the plan.

Approval phrases include: "proceed", "approved", "looks good", "go ahead", or equivalent.

## Step 5 — Generate Code

Only after receiving explicit human approval:

- Follow RULE-AI-01: Never rewrite an entire working file. Surgical edits only.
- Follow all rules in AI_RULES.md (strict type safety, design tokens, no inline colors).
- Only implement the current phase. Do not build ahead.
- Do not reorganize folders.
- Do not modify completed phases.

## Step 6 — Run Quality Gate

After generating all code, run the full Phase Quality Gate:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must pass with zero errors and zero warnings.

## Step 7 — Repository Health Check

After the Quality Gate passes, assess and report:

---
### Repository Health

| Field | Status |
|---|---|
| **Architecture Drift** | None / [describe] |
| **Duplicate Components** | None / [list] |
| **Unused Files** | None / [list] |
| **TypeScript Errors** | 0 |
| **ESLint Warnings** | 0 |
| **Build Status** | Passing |
| **Documentation Status** | Current |
| **Phase Status** | Ready for Next Phase |
---

## Step 8 — Update Documentation

Update the following living documents after every phase:

- PROJECT_STATUS.md — mark phase complete, update snapshot counts
- CHANGELOG.md — add version entry with what changed
- DECISIONS.md — if an architectural decision was required (not for trivial changes)

## Step 9 — Git Commit

Commit with a message that states WHY, not just what:

```bash
git add .
git commit -m "[Phase X Complete] [One sentence describing what was built and why]"
git tag v[version]
```

---

## Current Session

**Phase**: [Insert Current Phase Number, e.g., Phase 2A]
**Objective**: [Insert Target Objective]
**Out of Scope**: [List everything explicitly excluded from this session]
```

---

*XINVORA PROMPT_TEMPLATE.md — v2.0.0*
*Updated: 2026-07-01 — Added 9-step disciplined workflow with Change Impact Assessment and Repository Health check.*
*Original established: 2026*
