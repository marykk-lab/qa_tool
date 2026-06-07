---
phase: "01-foundation"
plan: "01"
subsystem: "scaffold"
tags: ["next.js", "tailwind", "typescript", "json-data-layer", "tdd", "vercel"]
dependency_graph:
  requires: []
  provides:
    - "TestCase TypeScript type at src/lib/types.ts — schema contract for all downstream phases"
    - "JSON data loader at src/lib/test-cases.ts — reads /data/test-cases/*.json"
    - "TestCaseCard client component — Tailwind-styled, interactive rendering of one test case"
    - "Next.js App Router project with Tailwind v4, buildable and deployable to Vercel"
  affects:
    - "Phase 2 Wizard — builds on established TestCase schema and JSON data convention"
    - "Phase 3 Generation & Output — builds on the same data loader and card component"
tech_stack:
  added:
    - "Next.js 16.2.7 (App Router, TypeScript)"
    - "React 19.2.4"
    - "Tailwind CSS v4 (via @tailwindcss/postcss)"
    - "Jest 30 + ts-jest (unit testing)"
  patterns:
    - "Server Component reads JSON via Node fs at build/render time"
    - "Client Component (use client) with useState for interactive toggle"
    - "JSON data at /data/test-cases/ (repo root, outside src/) — editable without recompile"
    - "TypeScript strict mode; @/* alias maps to src/*"
key_files:
  created:
    - "src/lib/types.ts — TestCase type (6-field schema contract)"
    - "src/lib/test-cases.ts — getSampleTestCase() and loadAllTestCases() loaders"
    - "src/components/TestCaseCard.tsx — styled card with priority badge and Показати деталі toggle"
    - "data/test-cases/sample.json — TC-CAT-001 sample test case"
    - "data/test-cases/README.md — schema docs and 10 ID-prefix table"
    - "src/__tests__/test-cases.test.ts — 6 TDD unit tests for loader and schema"
    - "jest.config.js — Jest config for ts-jest in Node environment"
  modified:
    - "src/app/page.tsx — wired to call getSampleTestCase() and render <TestCaseCard>"
    - "src/app/layout.tsx — lang='uk', Ukrainian page title"
    - "package.json — added test script, jest + ts-jest devDependencies"
decisions:
  - "Use Next.js default Vercel deploy mode (server-capable), not static export — keeps server/client component flexibility for Phase 2 wizard"
  - "Tailwind v4 used (create-next-app default) — uses @import 'tailwindcss' instead of v3 directives; no tailwind.config.ts needed"
  - "JSON read via Node fs in server context, not static import — QA can edit JSON without recompiling (GEN-01 preparation)"
  - "TestCase type uses Ukrainian field names as keys (Назва, Кроки, etc.) matching GEN-03 schema requirement"
metrics:
  duration: "~30 minutes"
  completed_date: "2026-06-04"
  tasks_completed: 3
  tasks_pending: 0
  files_created: 9
  files_modified: 3
---

# Phase 1 Plan 1: Walking Skeleton Summary

**One-liner:** Next.js 16 + Tailwind v4 scaffold with `TestCase` TypeScript type, `fs`-based JSON loader, and interactive `TestCaseCard` component — full data→render→interact slice proven locally, awaiting Vercel deploy confirmation.

## Tasks Completed

### Task 1: Scaffold Next.js + TypeScript + Tailwind — DONE (commit `23c360f`)

- Scaffolded Next.js 16 App Router project with TypeScript and Tailwind CSS v4
- Set `lang="uk"` on `<html>` element for Ukrainian UI requirement
- Replaced default page with Ukrainian placeholder heading styled with Tailwind classes
- Added `.gitignore` with `node_modules`, `.next`, `.env*`, `.vercel` entries
- `npm run build` passes successfully

### Task 2: JSON data layer + end-to-end render — DONE (commit `43661d4`)

- **RED commit** (`c253c48`): 6 failing TDD tests written for `getSampleTestCase()` and `TestCase` type
- **GREEN commit** (`43661d4`): Full implementation — all 6 tests pass, build succeeds
- `src/lib/types.ts` — `TestCase` type with all 6 Ukrainian schema fields
- `src/lib/test-cases.ts` — `getSampleTestCase()` and `loadAllTestCases()` via Node `fs`
- `data/test-cases/sample.json` — TC-CAT-001 with realistic Ukrainian content
- `data/test-cases/README.md` — full schema docs and all 10 ID-prefix table
- `src/components/TestCaseCard.tsx` — Client Component with `"use client"`, priority badge (red/yellow/green), `Показати деталі` toggle via `useState`
- `src/app/page.tsx` — wired loader + `<TestCaseCard>` render

### Task 3: Vercel Deploy — DONE (human verified)

Vercel production deployment confirmed working. Live URL serves the same rendered sample test-case page with six Ukrainian field labels, styled priority badge, and working "Показати деталі" toggle.

## Deviations from Plan

### Auto-adapted: Tailwind v4 instead of v3

**Found during:** Task 1
**Issue:** `create-next-app` installed Tailwind CSS v4 by default. Tailwind v4 does not use `tailwind.config.ts` or `@tailwind base/components/utilities` directives — it uses `@import "tailwindcss"` and `@tailwindcss/postcss` PostCSS plugin instead.
**Fix:** Kept Tailwind v4 (official, current version). `globals.css` uses `@import "tailwindcss"`. No `tailwind.config.ts` file (not needed in v4). Plan acceptance criteria for `tailwind.config.ts` content-glob and v3 directives are not applicable to v4 — Tailwind utility classes compile and apply correctly.
**Impact:** No downstream impact — classes work identically. Phase 3 theme customization will use v4 `@theme {}` blocks instead of `tailwind.config.ts` extend.

### Minor: `next-env.d.ts` excluded from commit (gitignored)

**Found during:** Task 1
**Issue:** `next-env.d.ts` is listed in `.gitignore` by default (it is auto-generated). Committed all other files as planned.
**Impact:** None — this is the standard Next.js convention.

## TDD Gate Compliance

| Gate | Status | Commit |
|------|--------|--------|
| RED (failing tests) | PASSED | `c253c48` |
| GREEN (passing tests) | PASSED | `43661d4` |
| REFACTOR | Not needed — code is clean |

## Known Stubs

None. The home page renders a real test case from `data/test-cases/sample.json` via the actual `fs`-based loader.

## Threat Flags

No new security-relevant surface beyond the plan's threat model. No `dangerouslySetInnerHTML` used. No secrets committed. `.gitignore` excludes `.env*` and `.vercel`.

## Self-Check: PASSED

All 4 Phase 1 success criteria confirmed:
1. `npm run dev` starts locally without errors — ✓
2. Vercel deployment succeeded, live URL accessible — ✓ (human verified)
3. `/data/test-cases/sample.json` exists with all 6 schema fields — ✓
4. Tailwind configured and renders classes (priority badge styled) — ✓

## Next Steps

1. Human: Deploy to Vercel (`npx vercel --prod`) and confirm live URL (Task 3 checkpoint)
2. Phase 2: Wizard flow builds on the established `TestCase` schema and JSON data convention
