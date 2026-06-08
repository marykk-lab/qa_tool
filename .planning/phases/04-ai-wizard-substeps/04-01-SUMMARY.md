---
phase: 04-ai-wizard-substeps
plan: "01"
subsystem: wizard
tags: [wizard, dynamic-steps, module-features, typescript]
dependency_graph:
  requires: [02-wizard, 03-generation-output]
  provides: [dynamic-module-sub-steps, module-features-state, step-counter-v2]
  affects: [Wizard.tsx, WizardNav.tsx, types.ts, wizard-config.ts]
tech_stack:
  added: []
  patterns: [dynamic-step-routing, per-module-checklist, conditional-render-via-map]
key_files:
  created:
    - src/components/wizard/StepModuleFeatures.tsx
  modified:
    - src/lib/types.ts
    - src/constants/wizard-config.ts
    - src/components/wizard/Wizard.tsx
    - src/components/wizard/WizardNav.tsx
decisions:
  - "getTotalSteps() returns 3 + state.modules.length; step 4..3+N are module sub-steps"
  - "MODULE_FEATURES constant holds exact Ukrainian feature strings for all 10 module IDs"
  - "moduleFeatures: Record<string, string[]> added to WizardState; initialized to {}"
  - "Feature?: string stub added to TestCase for Phase 4 JSON filtering"
  - "canAdvance returns true for step >= 4 (feature selection is optional)"
  - "isCompletion = currentStep > totalSteps; ResultsView renders when isCompletion is true"
metrics:
  duration: "249s"
  completed_date: "2026-06-08"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 5
---

# Phase 4 Plan 01: Dynamic Module Sub-steps Summary

Dynamic module sub-steps inserted after step 3 of the wizard; step counter becomes `3 + state.modules.length`; each module sub-step shows a feature checklist via the new `StepModuleFeatures` component.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend types.ts and wizard-config.ts | 25fd9bd | src/lib/types.ts, src/constants/wizard-config.ts |
| 2 | Create StepModuleFeatures component | 4bf5d6a | src/components/wizard/StepModuleFeatures.tsx |
| 3 | Rewrite Wizard.tsx step routing + WizardNav canAdvance | 75854b5 | src/components/wizard/Wizard.tsx, src/components/wizard/WizardNav.tsx |

## Decisions Made

- `getTotalSteps()` now returns `3 + state.modules.length` (replaces `hasDetailStep(state) ? 4 : 3`). This makes the step counter dynamic based on the number of selected modules.
- `MODULE_FEATURES` constant with all 10 module IDs and exact Ukrainian feature strings added to `wizard-config.ts`.
- `WizardState.moduleFeatures: Record<string, string[]>` tracks per-module checked features; initialized to `{}` in `INITIAL_WIZARD_STATE`.
- `TestCase.Feature?: string` stub added for Phase 4 JSON-based feature filtering (Plan 02).
- `StepModuleFeatures` component follows the same clickable-row pattern as `StepModules` with `stopPropagation` on the inner `Checkbox` control.
- `isCompletion = currentStep > totalSteps`; `ResultsView` renders when this is true.
- `canAdvance` in `WizardNav.tsx` returns `true` for `step >= 4` (feature selection is optional per D-05).
- `hasDetailStep` import removed from `Wizard.tsx`; `StepDetails` component remains in the codebase but is no longer part of the main step routing.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `TestCase.Feature?: string` — field exists in the type but is not yet populated in the 10 JSON test-case files. Feature-based filtering will be implemented in Plan 02. The field is intentionally optional so existing test cases without it always pass through.

## Threat Flags

No new security-relevant surface introduced. All changes are client-side ephemeral state and static config (T-04-01, T-04-02, T-04-SC accepted per plan threat model).

## Self-Check: PASSED

- src/components/wizard/StepModuleFeatures.tsx: FOUND
- src/lib/types.ts modified with moduleFeatures and Feature fields: FOUND
- src/constants/wizard-config.ts with MODULE_FEATURES and updated getTotalSteps: FOUND
- src/components/wizard/Wizard.tsx rewritten with dynamic sub-steps: FOUND
- src/components/wizard/WizardNav.tsx with updated canAdvance: FOUND
- Commits 25fd9bd, 4bf5d6a, 75854b5: FOUND in git log
- TypeScript: 0 errors (npx tsc --noEmit)
