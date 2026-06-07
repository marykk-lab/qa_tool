---
phase: "03"
plan: "01"
subsystem: "generation-config"
tags: [config, wiring, server-component, wizard]
dependency_graph:
  requires: [02-03-PLAN.md]
  provides: [MODULE_TC_PREFIXES, PROMO_TC_PREFIX, MODULE_DISPLAY_NAMES, initialCases-prop]
  affects: [src/constants/wizard-config.ts, src/app/page.tsx, src/components/wizard/Wizard.tsx, src/components/wizard/WizardNav.tsx]
tech_stack:
  added: []
  patterns: [Server Component data loading, async page component, prop drilling initialCases]
key_files:
  modified:
    - src/constants/wizard-config.ts
    - src/app/page.tsx
    - src/components/wizard/Wizard.tsx
    - src/components/wizard/WizardNav.tsx
decisions:
  - loadAllTestCases called in async Server Component page.tsx to avoid fs in client component
  - initialCases prop not yet consumed in Wizard JSX — threaded as typed prop for Plan 02 to use
  - isCompletion ternary collapsed to !isCompletion guard — action buttons now live exclusively in ResultsView
metrics:
  duration: "~10 minutes"
  completed: "2026-06-07T19:32:14Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 3 Plan 01: Config & Wiring Summary

**One-liner:** Added MODULE_TC_PREFIXES / PROMO_TC_PREFIX / MODULE_DISPLAY_NAMES constants, wired async Server Component data loading via page.tsx, and removed the WizardNav stub button.

## What Was Built

### Task 1 — MODULE_TC_PREFIXES, PROMO_TC_PREFIX, MODULE_DISPLAY_NAMES (commit: 9d92ee4)

Three new exported constants appended to `src/constants/wizard-config.ts`:

- `MODULE_TC_PREFIXES` — `Record<string, string[]>` mapping all 14 module IDs to TC-prefix arrays. Five modules without JSON files (`filter`, `compare`, `wishlist`, `subscription`, `gallery`) map to `[]`. `checkout` maps to `["TC-CHK"]` only; promo-code cases are handled via `PROMO_TC_PREFIX`.
- `PROMO_TC_PREFIX` — string constant `"TC-CPN"` for conditional inclusion when `hasPromoCode === true`.
- `MODULE_DISPLAY_NAMES` — `Record<string, string>` mapping all 14 module IDs to Ukrainian names taken verbatim from the existing `ECOMMERCE_MODULES` / `INFOSITE_MODULES` label values.

### Task 2 — Data wiring and WizardNav fix (commit: ed2e29b)

**page.tsx** — made async Server Component:
- Added `import { loadAllTestCases } from "@/lib/test-cases"` and `import type { TestCase } from "@/lib/types"`
- Function changed to `export default async function Home()`
- Calls `const allCases: TestCase[] = loadAllTestCases()` before return
- Passes `<Wizard initialCases={allCases} />`

**Wizard.tsx** — typed prop added:
- `TestCase` added to import from `@/lib/types`
- `type WizardProps = { initialCases: TestCase[] }` inserted before function
- Signature changed to `function Wizard({ initialCases }: WizardProps)`
- `initialCases` not yet used in JSX — available for Plan 02 to thread to ResultsView

**WizardNav.tsx** — stub button removed:
- Ternary `isCompletion ? <Button>Готово...</Button> : <Button>Далі</Button>` replaced with `{!isCompletion && <Button>Далі</Button>}`
- At step 5, only Назад button renders; action buttons will live in ResultsView (Plan 02)

## Verification

- `npx tsc --noEmit` — zero errors
- `npm run build` — succeeds; static page generated at `/`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None introduced. The `initialCases` prop is typed and passed but intentionally unused in JSX until Plan 02 wires it to ResultsView. This is documented in the plan and not a stub — Plan 02 explicitly consumes it.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. `loadAllTestCases` reads public static JSON files from `data/test-cases/` in Server Component context only.

## Self-Check: PASSED

- `src/constants/wizard-config.ts` — modified, exports MODULE_TC_PREFIXES, PROMO_TC_PREFIX, MODULE_DISPLAY_NAMES
- `src/app/page.tsx` — modified, async, calls loadAllTestCases, passes initialCases
- `src/components/wizard/Wizard.tsx` — modified, accepts initialCases: TestCase[]
- `src/components/wizard/WizardNav.tsx` — modified, !isCompletion guard, no stub button
- Commit 9d92ee4 exists (Task 1)
- Commit ed2e29b exists (Task 2)
