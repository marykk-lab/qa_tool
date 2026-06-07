---
phase: "03"
plan: "02"
subsystem: "generation-output"
tags: [results-view, generation, export, priority-badge, deterministic-logic]
dependency_graph:
  requires: [03-01-PLAN.md]
  provides: [PriorityBadge, ResultsView, filterCasesForModule, buildMarkdown, buildCsv]
  affects:
    - src/components/wizard/PriorityBadge.tsx
    - src/components/wizard/ResultsView.tsx
    - src/components/wizard/Wizard.tsx
tech_stack:
  added: []
  patterns:
    - deterministic-generation (ID-based case filtering)
    - Blob+createObjectURL file download
    - clipboard API with async/await + toast feedback
    - UTF-8 BOM CSV for Notion/Excel compatibility
key_files:
  created:
    - src/components/wizard/PriorityBadge.tsx
    - src/components/wizard/ResultsView.tsx
  modified:
    - src/components/wizard/Wizard.tsx
decisions:
  - worktree-branched-before-plan01 — merged main at task boundary to bring in initialCases prop and Plan 01 constants; wizard-config.ts generation constants pre-staged then reconciled via merge
  - ID-based exclusion for detail flags — no JSON schema changes needed; TC-CHK-003/TC-CPN/TC-SRCH-003/TC-SRCH-004/TC-FORM-003/TC-FORM-004/TC-LANG-003 excluded by explicit ID comparison
  - filterCasesForModule early-return on empty prefixes — modules without JSON files (filter, compare, wishlist, subscription, gallery) return immediately without scanning allCases
  - buildMarkdown pipes escaped with backslash to avoid breaking GFM table cells
metrics:
  duration: "~4 minutes"
  completed: "2026-06-07T19:39:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 3 Plan 02: PriorityBadge, ResultsView & Wizard Wiring Summary

**One-liner:** Deterministic test-case generation with ID-based filtering, grouped results table, and four export actions (copy Markdown, download .md, export CSV, restart) wired into Wizard step 5.

## What Was Built

### Task 1 — PriorityBadge.tsx and ResultsView.tsx (commit: efaa266)

**PriorityBadge.tsx** (`src/components/wizard/PriorityBadge.tsx`):
- Named export `PriorityBadge` — thin shadcn Badge wrapper with dark-theme priority colors
- `PRIORITY_STYLES` map: High = `bg-red-950/60 text-red-400 border-red-800`, Medium = `bg-amber-950/60 text-amber-400 border-amber-800`, Low = `bg-zinc-800/60 text-zinc-400 border-zinc-700`
- `aria-label="{priority} пріоритет"` for screen reader support
- No `"use client"` directive needed (pure display, no hooks)

**ResultsView.tsx** (`src/components/wizard/ResultsView.tsx`):

**Generation logic — `filterCasesForModule`:**
- Gathers TC-prefixes from `MODULE_TC_PREFIXES`
- Conditionally pushes `PROMO_TC_PREFIX` ("TC-CPN") for checkout when `hasPromoCode === true`
- Returns `[]` immediately for modules with empty prefix arrays (no JSON: filter, compare, wishlist, subscription, gallery)
- Prefix-filters `allCases` then applies ID-based exclusions:
  - `TC-CHK-003` excluded when `hasGuestCheckout === false`
  - `TC-CHK-005` excluded when `hasPromoCode === false`
  - `TC-SRCH-003` excluded when `hasAutoComplete === false`
  - `TC-SRCH-004` excluded when `hasFiltersInResults === false`
  - `TC-FORM-003` excluded when `hasFileUpload === false`
  - `TC-FORM-004` excluded when `hasCaptcha === false`
  - `TC-LANG-003` excluded when `languageCount === "2"`
  - Auth module: no exclusions
- Null-safe: if detail object is null, no exclusions fire (all cases included per D-09)

**Export functions:**
- `buildMarkdown` — GFM with H1 header, `## Module (N)` headings, table with Кроки as `1. step<br>2. step`
- `buildCsv` — UTF-8 BOM prefix, English column headers (ID,Name,Preconditions,Steps,Expected,Priority,Module), steps joined with `\n` and double-quoted
- `downloadFile` — Blob + createObjectURL + anchor click + revokeObjectURL

**Component:**
- Computes `filteredModules` (modules with >0 cases) at render time
- Empty state: `FileX` icon + "Тест кейси не знайдено" heading + body text; no action buttons
- Normal state: "Результати тестування" heading, module blocks in selection order, action buttons row
- Module block: `role="region"` + `aria-label` wrapper, `<th scope="col">` on all headers
- Four action buttons: Скопіювати Markdown (primary), Завантажити .md (outline accent), Експорт до Notion (.csv) (neutral outline), Почати заново (ghost)

### Task 2 — Wire ResultsView into Wizard.tsx step 5 (commit: da6f7ed)

Two edits to `src/components/wizard/Wizard.tsx`:
1. Added `import ResultsView from "./ResultsView";` after WizardNav import
2. Replaced step 5 placeholder div ("Готово!") with `<ResultsView state={state} allCases={initialCases} onRestart={...} />`
3. `onRestart` callback: `setState(INITIAL_WIZARD_STATE); setCurrentStep(1);`

## Verification

- `npx tsc --noEmit` — zero TypeScript errors
- `npm run build` — Next.js production build succeeds, static page generated at `/`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree branched before Plan 01 commits**

- **Found during:** Task 1 TypeScript compilation
- **Issue:** This worktree was created before Plan 01's commits (9d92ee4, ed2e29b) landed on main. wizard-config.ts was missing `MODULE_TC_PREFIXES`, `MODULE_DISPLAY_NAMES`, `PROMO_TC_PREFIX`. Wizard.tsx lacked the `initialCases` prop signature.
- **Fix:** Pre-staged generation constants to wizard-config.ts (identical to Plan 01), committed Task 1 files, then merged main into the worktree branch. Merge resolved cleanly — no conflicts. wizard-config.ts reconciled correctly (single set of constants).
- **Files modified:** `src/constants/wizard-config.ts` (in task 1 commit), `src/app/page.tsx`, `src/components/wizard/Wizard.tsx` (via merge)
- **Commits:** efaa266 (task 1 + pre-req constants), eb9929d (merge main)

## Known Stubs

None — all generation logic is fully wired to `allCases` prop from server-loaded JSON. Module blocks render real test case data. All four action buttons are functional.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced beyond what was scoped in the plan's `<threat_model>`:
- Clipboard API failure is caught and surfaces a Ukrainian error toast (T-03-02 mitigated)
- Filename constructed from controlled values only: `projectType` union + ISO date (T-03-03 mitigated)
- CSV cell values from static JSON, no user-typed text reflected (T-03-04 mitigated)

## Self-Check: PASSED

- `src/components/wizard/PriorityBadge.tsx` — created, exports `PriorityBadge`
- `src/components/wizard/ResultsView.tsx` — created, exports `default ResultsView`
- `src/components/wizard/Wizard.tsx` — modified, imports ResultsView, step 5 wired
- Commit efaa266 exists (Task 1)
- Commit da6f7ed exists (Task 2)
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
