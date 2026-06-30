# PROMPT_TEMPLATE.md — XINVORA AI Session Prompt Template

> **This template must head every future coding session prompt.**
>
> Copy this template to a new prompt block and fill out the bracketed sections before providing the instruction to the coding assistant.
>
> **DOCUMENTATION STATE: FROZEN. DO NOT EDIT.**

---

```markdown
# XINVORA System Context & Instruction

## Instructions for AI Agent
Read and parse the following documentation before generating any code or modifying any files:
- docs/AI_RULES.md
- docs/ARCHITECTURE.md
- docs/PROJECT_STATUS.md
- docs/BRAND_GUIDELINES.md

## Current Project Phase
Phase: [Insert Current Phase Number, e.g., Phase 1]
Objective: [Insert Target Objective, e.g., Initialize project directory layout]

## Constraints
1. Do not modify completed phases.
2. Do not reorganize folders.
3. Do not regenerate existing files. Always make targeted, surgical code edits.
4. List every file that will be modified or created before generating code.
5. Only implement the current phase. Do not build ahead.
6. Respect all rules in AI_RULES.md (strict type safety, design tokens, responsive spacing parameters).

## Active Task Instruction
[Insert detailed description of current feature or component to code, including inputs/outputs, styling expectations, or specific API requirements.]

## Verification Checks
Once coding is complete, the session must run the Phase Quality Gate checks:
1. Lint checks (`npm run lint` or equivalent configuration)
2. TypeScript compiling (`npx tsc --noEmit` or equivalent)
3. Local build check (`npm run build` or equivalent)
4. Confirm console runs clean and app starts up.
```

---

*XINVORA PROMPT_TEMPLATE.md — v1.0.0*
*Established: 2026*
