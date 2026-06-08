---
phase: 04-ai-wizard-substeps
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/wizard/StepModuleFeatures.tsx
  - src/lib/types.ts
  - src/constants/wizard-config.ts
  - src/components/wizard/Wizard.tsx
  - src/components/wizard/WizardNav.tsx
  - src/components/wizard/ResultsView.tsx
  - src/components/wizard/PriorityBadge.tsx
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: fixed
---

# Phase 04: Code Review Report

**Reviewed:** 2026-06-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 4 introduced dynamic module sub-steps (`StepModuleFeatures`), feature-based JSON filtering in `filterCasesForModule`, and a 7-column Suite-grouped results table in `ResultsView`/`PriorityBadge`. The UI rendering and feature-filter logic are generally correct, but three blockers were found:

1. `getTotalSteps` was rewritten to use a completely different formula (`3 + modules.length`) than the formula the entire test suite, `WizardNav`, and `Wizard.tsx` were designed around (`3 + (hasDetailStep ? 1 : 0)`). This causes incorrect step counts, a broken progress bar, and the nav rendering completion at the wrong step for nearly every module selection.
2. The `coupons` key in `MODULE_FEATURES` is a dead entry — it is never reachable by any module ID in the wizard and silently goes unused, leaving promo/coupon feature filtering permanently broken.
3. `filteredModules` is computed outside `useMemo` in `ResultsView`, so the `useMemo` dependency array contains a new array reference on every render, defeating memoisation entirely and re-running `filterCasesForModule` on every keystroke or state tick.

---

## Critical Issues

### CR-01: `getTotalSteps` formula diverges from the design contract — wrong step count for all multi-module selections

**File:** `src/constants/wizard-config.ts:57`

**Issue:** The implementation returns `3 + state.modules.length`. Every other component, every test in `wizard-config.test.ts`, and every test in `wizard-flow.test.ts` was designed around the contract `3 + (hasDetailStep(state) ? 1 : 0)` — i.e., a maximum of 4 steps with a single optional detail step. The Phase 4 spec replaced the single detail step with N module sub-steps (one sub-step per module), but `getTotalSteps` was updated while `Wizard.tsx` and `WizardNav.tsx` were not refactored to match.

Concrete breakages:
- A user selecting 3 modules sees "Step 3 of 6" at the module selection screen, because `totalSteps` is already 6 before any sub-steps are visited.
- `isCompletion = currentStep > totalSteps` fires at `currentStep === 7` instead of after the last sub-step, so the results view never renders unless the user clicks "Далі" past the last module (but `handleNext` just increments by 1 each time, so this accidentally works only when all N module sub-steps are traversed in order and nothing has been skipped — however `WizardNav` progress percentage is still wrong throughout).
- `WizardNav` caps `displayStep` at `totalSteps`, so on completion the step counter shows e.g. "6 of 6" instead of "Готово" for the first half of the completion render (the `isCompletion` guard fixes the label but `percent` is computed before the guard, so it can render 100% before completion is reached for certain module counts).
- All `wizard-config.test.ts` and `wizard-flow.test.ts` assertions that `getTotalSteps` returns `3` or `4` will fail.

**Fix:**
```typescript
// wizard-config.ts
export function getTotalSteps(state: WizardState): number {
  // 3 fixed steps + one sub-step per selected module
  return 3 + state.modules.length;
}
```
That formula is correct for the Phase 4 sub-step architecture. The fix is to update `WizardNav` progress percentage and label computation — and delete/rewrite the test suite — to match it. Alternatively, if the old single-detail-step model was intended to remain:
```typescript
export function getTotalSteps(state: WizardState): number {
  return 3 + (hasDetailStep(state) ? 1 : 0);
}
```
and the sub-steps should never have been added to `Wizard.tsx` lines 90-104. **One model must be chosen and applied consistently across all three files.** Currently the config formula says "N sub-steps" but the tests and nav say "0 or 1 detail step".

---

### CR-02: `coupons` key in `MODULE_FEATURES` is unreachable — promo/coupon feature filtering is permanently dead

**File:** `src/constants/wizard-config.ts:212`

**Issue:** `MODULE_FEATURES` contains a `"coupons"` key with five feature strings. However no module ID in `ECOMMERCE_MODULES` or `INFOSITE_MODULES` is `"coupons"`. The checkout module's promo-code cases (`TC-CPN-*`) are filtered by the boolean `state.checkoutDetails.hasPromoCode`, not by the feature checklist. When `StepModuleFeatures` is shown for the `"checkout"` module it reads `MODULE_FEATURES["checkout"]`, not `MODULE_FEATURES["coupons"]`, so the coupon feature checkboxes are never shown and never populated in `state.moduleFeatures`.

This means:
- Any `TestCase` with `Feature` matching one of the five coupon strings (e.g. `"застосування валідного купону"`) will be excluded from results whenever the checkout module has *any* features selected (because `selectedFeatures` for `"checkout"` will never contain those strings, so the filter `!tc.Feature || selectedFeatures.includes(tc.Feature)` will drop them).
- The `coupons` entry in `MODULE_FEATURES` is pure dead code.

**Fix:** Either merge the coupon features into the `"checkout"` key (so checkout sub-step shows them) or remove the `"coupons"` key entirely and ensure no `TC-CPN-*` test case has a `Feature` field that matches the unreachable strings:
```typescript
// Option A — merge into checkout key in MODULE_FEATURES:
checkout: [
  "форма доставки",
  "форма оплати",
  "вибір способу доставки",
  "вибір способу оплати",
  "застосування промокоду",       // maps to TC-CPN Feature values
  "підсумок замовлення",
  "гостьове оформлення",
  "підтвердження замовлення (email)",
  "відмова платежу",
  // coupon sub-features if desired:
  "застосування валідного купону",
  "прострочений купон",
  "мінімальна сума замовлення",
  "два купони одночасно",
  "пробіли в коді купону",
],
// then remove the standalone "coupons" key
```

---

### CR-03: `filteredModules` computed outside `useMemo` makes the `casesByModule` memo always stale

**File:** `src/components/wizard/ResultsView.tsx:204-210`

**Issue:** `filteredModules` is derived by calling `filterCasesForModule` inside a plain `filter()` on lines 204-206, outside any memoisation. It produces a new array reference every render. It is then listed as a dependency of the `useMemo` on line 209. Because the reference is always new, the `useMemo` recomputes `filterCasesForModule` for every module on every render cycle — including re-renders triggered by collapsing suites or any parent state update. For a wizard with 10 modules this calls `filterCasesForModule` 20 times per render instead of once.

More critically, `filteredModules` is also used to build `suiteMap` outside `useMemo` (lines 217-225), so that computation also reruns unconditionally. The `useMemo` on `casesByModule` provides no actual benefit.

**Fix:**
```tsx
// Move filteredModules inside useMemo or use a separate useMemo:
const { filteredModules, casesByModule } = useMemo(() => {
  const filtered = state.modules.filter(
    (m) => filterCasesForModule(m, state, state.moduleFeatures, allCases).length > 0
  );
  const byModule = new Map(
    filtered.map((m) => [m, filterCasesForModule(m, state, state.moduleFeatures, allCases)])
  );
  return { filteredModules: filtered, casesByModule: byModule };
}, [state, allCases]);
```

---

## Warnings

### WR-01: `Wizard.tsx` — no validation guard for module sub-steps

**File:** `src/components/wizard/Wizard.tsx:26-39`

**Issue:** `handleNext` validates steps 1, 2, and 3 but has no guard for steps 4 through `totalSteps` (the module sub-steps). Since `canAdvance` in `WizardNav` returns `true` for all `step >= 4` (line 21 of `WizardNav.tsx`) this is consistent, but the comment in `WizardNav.tsx` says "sub-steps: features are optional", which means it is a deliberate design choice. However `handleNext` has no `else` branch — if `currentStep` is, say, 5 and none of the three guards fire, it falls through to `setCurrentStep(prev => prev + 1)` silently. This is actually correct behaviour, but the absence of any `default` branch or comment makes the logic opaque and could cause silent regressions if a new guard condition is added incorrectly.

**Fix:** Add an explicit comment or default case:
```typescript
function handleNext() {
  if (currentStep === 1 && !state.projectType) { ... }
  if (currentStep === 2 && !state.platform) { ... }
  if (currentStep === 3 && state.modules.length === 0) { ... }
  // steps >= 4 are module sub-steps: features are optional, always advance
  setCurrentStep((prev) => prev + 1);
}
```

---

### WR-02: `WizardNav` — progress percentage can reach 100% before completion step

**File:** `src/components/wizard/WizardNav.tsx:33-34`

**Issue:** `percent` is computed as `Math.round((displayStep / totalSteps) * 100)` where `displayStep = Math.min(currentStep, totalSteps)`. When `currentStep === totalSteps` (the last sub-step, not yet completion), `percent` equals 100. The progress bar shows 100% while the "Далі" button is still visible and the user has not yet submitted. This gives a false signal that the wizard is finished before it is.

**Fix:** Clamp progress to at most 99% until `isCompletion` is true:
```typescript
const percent = isCompletion ? 100 : Math.min(99, Math.round((displayStep / totalSteps) * 100));
```

---

### WR-03: `StepModuleFeatures` — `id` attribute collision when feature string appears in multiple modules

**File:** `src/components/wizard/StepModuleFeatures.tsx:43`

**Issue:** The `<Checkbox id={feature} ...>` uses the raw feature string as the HTML `id`. Some feature strings are identical across modules — for example `"пошук у каталозі"` (catalog) vs `"пошук за точною назвою"` (search) are distinct, but if any two modules share an identical feature label string (e.g. a future addition), the DOM would have duplicate `id` attributes. More immediately, if a user navigates back and forward through sub-steps, multiple checkboxes with the same `id` may be present in the DOM simultaneously via React's reconciliation, causing `<label>` accessibility bindings to break.

**Fix:** Prefix the `id` with the module ID, which is already available as the `_moduleId` prop:
```tsx
// Change the prop destructuring to use moduleId (drop the _ prefix):
export default function StepModuleFeatures({ moduleId, moduleName, features, selected, onChange }: Props) {
  // ...
  <Checkbox
    id={`${moduleId}-${feature}`}
    // ...
  />
  <label htmlFor={`${moduleId}-${feature}`}>{feature}</label>
```

---

### WR-04: `filterCasesForModule` — `authDetails` exclusion comment silently omits filtering

**File:** `src/components/wizard/ResultsView.tsx:75`

**Issue:** The comment on line 75 reads: "auth: hasSocialLogin / hasOrderHistory collected but no TC-AUTH exclusion IDs defined in v1". This means user selections for `hasSocialLogin` and `hasOrderHistory` in the auth detail step are collected into `state.authDetails` but have zero effect on the output. If a user says "no social login" they still get the social-login test cases. This is silent data loss from the user's perspective — they answered questions that produced no effect.

Combined with Phase 4 feature filtering: if a user deselects `"вхід через соцмережі"` in the auth module sub-step features checklist, the feature filter **will** suppress those cases (because `tc.Feature === "вхід через соцмережі"` and it's not in `selectedFeatures`). But `authDetails.hasSocialLogin` collected on the separate detail step does nothing. The two filtering mechanisms are inconsistent for the auth module.

**Fix (short-term):** Either document this explicitly in the UI (tell the user the auth detail step has no effect yet), add the exclusion IDs, or remove `authDetails` from `WizardState` until the exclusions are implemented to avoid collecting data that is silently ignored.

---

## Info

### IN-01: `MODULE_FEATURES` missing entries for several selectable modules

**File:** `src/constants/wizard-config.ts:116`

**Issue:** `MODULE_FEATURES` has no entries for `"filter"`, `"compare"`, `"wishlist"`, `"subscription"`, or `"gallery"`. These modules appear in `ECOMMERCE_MODULES` / `INFOSITE_MODULES` and are selectable by the user. `Wizard.tsx` uses `MODULE_FEATURES[moduleId] ?? []` (line 97), so their sub-steps render an empty feature list — the user sees a blank sub-step with only the module name and "Оберіть функції, які реалізовані у вашому проекті" but no checkboxes. This is a degraded (though not broken) experience. `MODULE_TC_PREFIXES` maps all five to empty arrays, so `filterCasesForModule` returns `[]` for them and they are excluded from results anyway — but the sub-step itself is still shown and traversed.

**Fix:** Either add feature entries for these modules or skip the sub-step rendering when `MODULE_FEATURES[moduleId]` is undefined/empty (and `MODULE_TC_PREFIXES[moduleId]` is also empty):
```tsx
// In Wizard.tsx, skip sub-steps for modules with no data:
{state.modules.map((moduleId, index) => {
  const subStep = 4 + index;
  const hasFeatures = (MODULE_FEATURES[moduleId]?.length ?? 0) > 0;
  const hasCases = (MODULE_TC_PREFIXES[moduleId]?.length ?? 0) > 0;
  if (!hasFeatures && !hasCases) return null; // skip entirely
  return currentStep === subStep ? <StepModuleFeatures ... /> : null;
})}
```

---

### IN-02: `_moduleId` prop is destructured but never used in `StepModuleFeatures`

**File:** `src/components/wizard/StepModuleFeatures.tsx:14`

**Issue:** The `moduleId` prop is received and renamed to `_moduleId` with a leading underscore to suppress the "unused variable" lint warning. It is referenced nowhere in the component body. As noted in WR-03 above, it should actually be used to generate unique `id` attributes for checkboxes. The underscore prefix pattern is a workaround that hides the missing usage.

**Fix:** Use `moduleId` directly (drop the rename) as part of the fix for WR-03.

---

_Reviewed: 2026-06-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
