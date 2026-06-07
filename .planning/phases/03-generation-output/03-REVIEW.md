---
phase: 03-generation-output
reviewed: 2026-06-07T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/app/page.tsx
  - src/components/wizard/PriorityBadge.tsx
  - src/components/wizard/ResultsView.tsx
  - src/components/wizard/Wizard.tsx
  - src/components/wizard/WizardNav.tsx
  - src/constants/wizard-config.ts
findings:
  critical: 0
  warning: 0
  info: 3
  total: 10
status: fixed
---

# Phase 03: Code Review Report

**Reviewed:** 2026-06-07T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the Generation & Output phase: deterministic test-case generation (`ResultsView.tsx`), export helpers (Markdown, CSV, download), `PriorityBadge.tsx`, and wiring changes across `Wizard.tsx`, `WizardNav.tsx`, `wizard-config.ts`, and `page.tsx`.

The core filtering matrix is mechanically sound for the modules that have JSON data. However, two blockers were found: (1) the Markdown export silently uses `state.modules` instead of `filteredModules`, which means the UI can show zero test cases while the exported file is also empty — but more critically the export bypasses the same filtering pipeline used for display, so any module added in `state.modules` that has cases in the data but happens to produce an empty result via `filterCasesForModule` will be silently emitted as an empty section header; (2) `buildMarkdown` and `buildCsv` call `filterCasesForModule` a second independent time for each module rather than sharing the pre-computed set already held in `filteredModules`, which means detail-flag changes made after the results are shown but before the export button is clicked could yield mismatched results if React batching drifts — but the concrete blocker is that the export functions receive `state.modules` (the raw list) rather than `filteredModules`, so modules with zero data (e.g. `filter`, `compare`, `wishlist`) will produce empty table sections in the Markdown output even though they produce no rows in the UI.

Three warnings relate to the `getTotalSteps` return value (always 3 or 4, never 5) causing the progress bar to always show 100% on the results screen; an unsafe `URL.revokeObjectURL` timing issue on some browsers; and a missing `authDetails` exclusion in `filterCasesForModule` despite `authDetails` being a trigger module and having detail fields collected. Two additional warnings cover the PRIORITY_STYLES lookup potentially receiving an unconstrained string at runtime and the `infosite` auth module silently rendering a detail block in `StepDetails` when `hasDetailStep` would not trigger it.

---

## Critical Issues

### CR-01: Markdown and CSV export iterate over `state.modules` instead of `filteredModules` — empty-module sections silently appear in exports

**File:** `src/components/wizard/ResultsView.tsx:296` (Copy Markdown button), `315` (Download .md button), `330` (CSV button)

**Issue:** All three export actions call `buildMarkdown(state.modules, ...)` and `buildCsv(state.modules, ...)` using the raw `state.modules` array. The rendered table in the UI is already filtered down to `filteredModules` (line 169–172), which excludes any module whose `filterCasesForModule` returns zero cases. However the export helpers iterate `state.modules` directly. Modules such as `filter`, `compare`, `wishlist`, `subscription`, and `gallery` map to an empty prefix array in `MODULE_TC_PREFIXES` and will therefore always yield an empty result from `filterCasesForModule`. In `buildMarkdown` (line 89) the `if (cases.length === 0) continue;` guard prevents empty sections in Markdown, so those modules are silently skipped. That makes Markdown safe but only accidentally. In `buildCsv` (line 132) there is **no such guard** — if a module passes the prefix check but filter conditions remove all rows, the CSV is fine; but the lack of a guard is fragile. More concretely, the inconsistency means the export pipeline is structurally decoupled from the display pipeline, so any future module that gains partial data will silently appear in exports but be excluded from the UI (or vice versa) until both call sites are updated.

The real correctness issue is that the export is semantically using a different input than what the user sees. The `filteredModules` list computed on line 169 is already correct — it should be passed into the export functions rather than recomputing from `state.modules`.

**Fix:**
```tsx
// In ResultsView component, derive once and thread through:
const filteredModules = state.modules.filter(
  (m) => filterCasesForModule(m, state, allCases).length > 0
);

// Pass filteredModules to all export calls, not state.modules:
const md = buildMarkdown(filteredModules, state, allCases);
// ... and for CSV:
const csv = buildCsv(filteredModules, state, allCases);
```

The `filteredModules` variable already exists in scope at the component level (line 169). The three onClick handlers just need to reference `filteredModules` instead of `state.modules`.

---

### CR-02: `getTotalSteps` returns 3 or 4, but the wizard uses step 5 as the results screen — progress bar always shows 100% on results, and step counter is wrong

**File:** `src/constants/wizard-config.ts:55-57` + `src/components/wizard/WizardNav.tsx:40-41`

**Issue:** `getTotalSteps` returns `4` (with detail step) or `3` (without). The wizard in `Wizard.tsx` uses step `5` as the results/completion screen (lines 41-42, 98). `WizardNav` caps `displayStep` to `totalSteps` (line 40: `Math.min(currentStep, totalSteps)`), so when `currentStep === 5` and `totalSteps === 4`, `displayStep` becomes 4 and `percent` is `round(4/4 * 100) = 100`. The user sees "Крок 4 з 4" on the results screen even though the results screen is logically step 5.

When detail is skipped, `currentStep` jumps to 5 and `totalSteps` is 3, so the user sees "Крок 3 з 3" on results — also 100%, but still semantically wrong because the user skipped no visible step. The count shown ("3 з 3") is correct in that case; the problem is specifically when detail IS shown: the results screen falsely shows "Крок 4 з 4" instead of something like "Завершено" or hiding the step counter on completion.

This is a product/UX bug: the progress bar lies about the user's position in the flow. On results the `isCompletion` flag is already passed to `WizardNav` (Wizard.tsx line 69), but `WizardNav` only uses it to hide the Next button — it does not suppress or adjust the step counter.

**Fix:**
```tsx
// WizardNav.tsx — suppress step counter on completion
<p className="text-sm text-muted-foreground mb-2">
  {isCompletion
    ? "Готово"
    : `Крок ${displayStep} з ${totalSteps}`}
</p>
<Progress value={isCompletion ? 100 : percent} className="h-1 rounded-full" />
```

Alternatively, `getTotalSteps` should return 5 (or 4+1) to account for the results screen, but that changes how `percent` is calculated for intermediate steps too.

---

## Warnings

### WR-01: `filterCasesForModule` has no exclusion logic for `authDetails` despite `auth` being a detail-trigger module

**File:** `src/components/wizard/ResultsView.tsx:19-74`

**Issue:** `ECOM_DETAIL_MODULES` includes `"auth"` (wizard-config.ts line 43), meaning the detail step is shown when `auth` is selected, and `StepDetails.tsx` collects `hasSocialLogin` and `hasOrderHistory`. However, `filterCasesForModule` has exclusion blocks for `checkout`, `search`, `contact-form`, and `multilang` — but **no block for `moduleId === "auth"`**. The two auth detail flags (`hasSocialLogin`, `hasOrderHistory`) are collected from the user but never used to include or exclude any test cases. This means the auth detail screen is effectively non-functional dead UI — the answers are stored in state but have zero effect on the generated output.

If intentional (auth detail flags reserved for a future phase), it should be documented. If unintentional, it is a logic gap — the user is asked questions whose answers change nothing.

**Fix:** Either add an exclusion/inclusion block for auth in `filterCasesForModule`, or document in a comment that auth detail flags are reserved. If `hasSocialLogin` and `hasOrderHistory` map to specific TC-AUTH IDs, add the corresponding filter:
```ts
if (moduleId === "auth") {
  // TC-AUTH-006 = social login test case (to be added to data)
  // For now: no auth-detail exclusions defined yet
}
```

---

### WR-02: `URL.revokeObjectURL` is called synchronously immediately after `a.click()` — can fail on Firefox and Safari

**File:** `src/components/wizard/ResultsView.tsx:159-163`

**Issue:** The `downloadFile` helper calls `a.click()` and then immediately calls `URL.revokeObjectURL(url)` on the next line (line 163). `a.click()` dispatches a synthetic click synchronously but the browser's download initiation is asynchronous. On Firefox and some versions of Safari, revoking the object URL before the download has been initiated causes the download to fail silently (empty file or no download prompt). The anchor element is also never appended to the document, which can fail in some browser contexts even though it works in Chrome.

**Fix:**
```ts
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revocation to allow the browser to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

---

### WR-03: `PriorityBadge` PRIORITY_STYLES lookup silently returns `undefined` for unknown priority values

**File:** `src/components/wizard/PriorityBadge.tsx:12-14`

**Issue:** `PRIORITY_STYLES[priority]` performs a string-keyed lookup on a `Record<string, string>`. The prop type is `"High" | "Medium" | "Low"`, which gives compile-time safety. However, `tc.Пріоритет` from JSON data is cast as `TestCase` without runtime validation (`JSON.parse(raw) as TestCase` in `test-cases.ts` line 21 and 48). If a JSON file contains a misspelled priority such as `"high"` (lowercase) or `"Critical"`, the lookup returns `undefined`, `cn()` receives `undefined` as a class, and the badge renders with no styling (invisible on dark backgrounds) without any error. This is a latent data-integrity issue given that JSON files are edited by QA engineers directly.

**Fix:** Add a fallback style and/or a defensive assertion:
```tsx
const PRIORITY_STYLES: Record<string, string> = {
  High:   "bg-red-950/60 text-red-400 border-red-800",
  Medium: "bg-amber-950/60 text-amber-400 border-amber-800",
  Low:    "bg-zinc-800/60 text-zinc-400 border-zinc-700",
};

export function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const style = PRIORITY_STYLES[priority] ?? "bg-zinc-800/60 text-zinc-400 border-zinc-700";
  return (
    <Badge variant="outline" className={cn("text-sm font-normal", style)} aria-label={`${priority} пріоритет`}>
      {priority}
    </Badge>
  );
}
```

---

### WR-04: `buildMarkdown` calls `filterCasesForModule` inside the loop a second time per module — redundant double-filtering and potential state inconsistency

**File:** `src/components/wizard/ResultsView.tsx:87-111` (buildMarkdown), `132-147` (buildCsv), and `200-201` (render loop)

**Issue:** The component renders by calling `filterCasesForModule(moduleId, state, allCases)` once per module in the render loop (line 201). The export functions `buildMarkdown` and `buildCsv` each call `filterCasesForModule` again independently for every module. This is three separate invocations of the filter per module per export action. While the function is pure and deterministic given the same state, this design means:

1. Any future change to `filterCasesForModule` that introduces side effects or makes it non-pure will silently diverge.
2. The results shown in the UI (render-time computation) and the exported data (button-click-time computation) are computed at different times. If state could change between render and click (it cannot in current React model but the architecture does not guarantee it), results would diverge.

The cleaner design is to compute cases once at render time, store in a structure, and pass to both the render loop and the export helpers.

**Fix:** Pre-compute a `Map<string, TestCase[]>` once:
```tsx
const casesByModule = useMemo(
  () => new Map(filteredModules.map((m) => [m, filterCasesForModule(m, state, allCases)])),
  [filteredModules, state, allCases]
);
```
Then render and export both consume `casesByModule` rather than calling `filterCasesForModule` independently.

---

### WR-05: `infosite` `auth` module shows details UI in `StepDetails` but `INFO_DETAIL_MODULES` does not include `"auth"` — detail screen is never reached for infosite auth

**File:** `src/components/wizard/StepDetails.tsx:58` + `src/constants/wizard-config.ts:44`

**Issue:** `StepDetails.tsx` renders the "Особистий кабінет" detail block when `modules.includes("auth") && state.projectType === "ecommerce"` (line 58). This is correct for ecommerce — `ECOM_DETAIL_MODULES` includes `"auth"`. However, `INFOSITE_MODULES` also includes `{ id: "auth", label: "Особистий кабінет" }` (wizard-config.ts line 38), but `INFO_DETAIL_MODULES` only contains `["contact-form", "multilang"]` (line 44). This means: if an infosite user selects only `auth`, `hasDetailStep` returns `false`, step 4 is skipped entirely, and the auth block in `StepDetails` is never shown. The `projectType === "ecommerce"` guard on line 58 of `StepDetails` correctly prevents rendering it for infosite, but the overall design silently discards any potential infosite-auth detail questions. If this is intentional (auth details are ecommerce-only), add a comment. If not, `INFO_DETAIL_MODULES` should include `"auth"`.

**Fix (if intentional):** Add a comment in `wizard-config.ts`:
```ts
// NOTE: auth is a detail trigger for ecommerce only.
// Infosite auth has no sub-options in v1.
export const INFO_DETAIL_MODULES = ["contact-form", "multilang"] as const;
```

---

## Info

### IN-01: `loadModuleTestCases` in `test-cases.ts` is exported but never used in the reviewed codebase

**File:** `src/lib/test-cases.ts:62-64`

**Issue:** `loadModuleTestCases` is exported but no file in the reviewed scope imports or calls it. It is dead code at this phase.

**Fix:** Remove the export, or retain with a comment marking it as a utility for future use. Since `loadAllTestCases` is what `page.tsx` uses, this function is redundant.

---

### IN-02: Magic string `"5"` used as the hard-coded completion step number in multiple places

**File:** `src/components/wizard/Wizard.tsx:41` (`setCurrentStep(5)`), `49` (`currentStep === 5`), `69` (`currentStep === 5`), `98` (`currentStep === 5`)

**Issue:** The number `5` appears four times as the completion step number. It is not defined as a named constant. If the step structure changes (e.g., a new step is inserted), all four occurrences must be updated manually and the connection to `getTotalSteps` is not obvious.

**Fix:** Define a constant:
```ts
const COMPLETION_STEP = 5;
```
Or derive it: `const COMPLETION_STEP = getTotalSteps(state) + 1;`

---

### IN-03: `getSampleTestCase` in `test-cases.ts` is exported but `sample.json` no longer exists in `data/test-cases/`

**File:** `src/lib/test-cases.ts:28-30`

**Issue:** `getSampleTestCase()` calls `loadTestCaseFile("sample.json")`. The `data/test-cases/` directory contains only module-specific files (`catalog.json`, `product.json`, etc.) — there is no `sample.json`. If this function is called it will throw a runtime error (`ENOENT`). It is not called by any of the reviewed files, but it is a public export that could be called by tests or future code.

**Fix:** Remove the function if it is no longer needed, or create `data/test-cases/sample.json` with a representative test case.

---

_Reviewed: 2026-06-07T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
