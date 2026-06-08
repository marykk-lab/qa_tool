---
phase: 04-ai-wizard-substeps
fixed_at: 2026-06-08T00:00:00Z
review_path: .planning/phases/04-ai-wizard-substeps/04-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-06-08T00:00:00Z
**Source review:** .planning/phases/04-ai-wizard-substeps/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Tests for `getTotalSteps` used the old Phase 3 formula — did not match Phase 4 implementation

**Files modified:** `src/__tests__/wizard-config.test.ts`, `src/__tests__/wizard-flow.test.ts`, `src/__tests__/wizard-nav.test.ts`

**Applied fix:** Updated all three test files to reflect the Phase 4 formula `3 + modules.length`:
- `wizard-config.test.ts`: Rewrote `getTotalSteps` describe block with 4 cases covering 0/1/2/3 modules.
- `wizard-flow.test.ts`: Rewrote entirely — replaced old skip-based `computeNext`/`computeBack` helpers and tests with Phase 4 sequential navigation model; `computeNext` always increments by 1, `computeBack` from completion returns `totalSteps`.
- `wizard-nav.test.ts`: Fixed `canAdvance` helper from `switch/case 4` to `if (step >= 4) return true` (matching WizardNav.tsx), updated "step 5" test to confirm all sub-steps advance.

---

### CR-02: `coupons` key in `MODULE_FEATURES` was unreachable — coupon feature filtering permanently broken

**Files modified:** `src/constants/wizard-config.ts`

**Applied fix:** Merged the 5 coupon feature strings into the `checkout` key in `MODULE_FEATURES` (they are now accessible when the checkout module sub-step is shown), then removed the standalone `coupons` key entirely.

---

### CR-03: `filteredModules` computed outside `useMemo` caused `casesByModule` memo to always recompute

**Files modified:** `src/components/wizard/ResultsView.tsx`

**Applied fix:** Replaced the separate `filteredModules` plain expression + broken `useMemo(casesByModule)` + inline `suiteMap` loop with a single `useMemo` returning `{ filteredModules, casesByModule, suiteMap, suiteNames, isEmpty }`. All five values are now derived together from `[state, allCases]` and only recomputed when those change.

---

### WR-01: `handleNext` fallthrough to sub-steps was implicit — no comment explaining the intent

**Files modified:** `src/components/wizard/Wizard.tsx`

**Applied fix:** Added comment `// steps >= 4 are module sub-steps: features are optional, always advance` immediately before `setCurrentStep((prev) => prev + 1)`.

---

### WR-02: Progress bar reached 100% before completion step

**Files modified:** `src/components/wizard/WizardNav.tsx`

**Applied fix:** Changed `percent` computation to `isCompletion ? 100 : Math.min(99, Math.round((displayStep / totalSteps) * 100))`. Progress bar now never shows 100% until `isCompletion` is true. Removed the redundant `isCompletion ? 100 : percent` from the `<Progress value>` prop (simplified to just `value={percent}`).

---

### WR-03: Checkbox `id` attribute used raw feature string — collision possible across modules

**Files modified:** `src/components/wizard/StepModuleFeatures.tsx`

**Applied fix:** Removed the `_moduleId` rename — `moduleId` is now used directly. Changed checkbox `id` to `\`${moduleId}-${feature}\`` to guarantee uniqueness across modules. Replaced the `<span>` label with a proper `<label htmlFor={...}>` for correct accessibility binding.

---

### WR-04: Comment about `authDetails` being silently ignored was unclear

**Files modified:** `src/components/wizard/ResultsView.tsx`

**Applied fix:** Updated comment to explicitly state that `hasSocialLogin`/`hasOrderHistory` have no filtering effect and that feature filtering via `StepModuleFeatures` is the correct mechanism for controlling auth cases.

---

_Fixed: 2026-06-08T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
