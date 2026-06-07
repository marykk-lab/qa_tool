---
phase: 03-generation-output
fixed_at: 2026-06-07T00:00:00Z
review_path: .planning/phases/03-generation-output/03-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-06-07T00:00:00Z
**Source review:** .planning/phases/03-generation-output/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (CR-01, CR-02, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Markdown and CSV export iterate over state.modules instead of filteredModules

**Files modified:** `src/components/wizard/ResultsView.tsx`
**Commit:** bdbfc0d
**Applied fix:** Changed all three export onClick handlers to call `buildMarkdown(filteredModules, state, casesByModule)` and `buildCsv(filteredModules, casesByModule)` instead of passing `state.modules` and `allCases`. This aligns the export pipeline with the display pipeline. Done as part of the WR-04 refactor since casesByModule is the shared map.

### CR-02: Step counter shows wrong label on completion screen

**Files modified:** `src/components/wizard/WizardNav.tsx`
**Commit:** 6b04d51
**Applied fix:** Changed the step counter `<p>` to render `"Готово"` when `isCompletion` is true, and set `<Progress value={isCompletion ? 100 : percent}` so the progress bar is pinned to 100% on the results screen.

### WR-01: filterCasesForModule has no exclusion logic for auth despite it being a detail-trigger module

**Files modified:** `src/components/wizard/ResultsView.tsx`
**Commit:** bdbfc0d
**Applied fix:** Added a doc-only comment block after the multilang exclusion block: `// auth: hasSocialLogin / hasOrderHistory collected but no TC-AUTH exclusion IDs defined in v1`. No broken filter logic was added per fix instructions.

### WR-02: URL.revokeObjectURL called synchronously after a.click() — fails on Firefox/Safari

**Files modified:** `src/components/wizard/ResultsView.tsx`
**Commit:** bdbfc0d
**Applied fix:** Rewrote `downloadFile` to append the anchor to `document.body` before clicking, remove it after, and wrap `URL.revokeObjectURL` in a `setTimeout(..., 100)` to allow the browser to initiate the download before the blob URL is revoked.

### WR-03: PriorityBadge PRIORITY_STYLES lookup returns undefined for unknown priority values

**Files modified:** `src/components/wizard/PriorityBadge.tsx`
**Commit:** 8022d74
**Applied fix:** Extracted `const style = PRIORITY_STYLES[priority] ?? "bg-zinc-800/60 text-zinc-400 border-zinc-700"` before the return, and used `style` in the className. Unknown priority values now render with a neutral zinc fallback style.

### WR-04: buildMarkdown and buildCsv each call filterCasesForModule independently — redundant double-filtering

**Files modified:** `src/components/wizard/ResultsView.tsx`
**Commit:** bdbfc0d
**Applied fix:** Added `import { useMemo } from "react"`. Added `casesByModule` as a `useMemo`-derived `Map<string, TestCase[]>` in the component body, computed once from `filteredModules`. Updated `buildMarkdown` and `buildCsv` signatures to accept `casesByModule: Map<string, TestCase[]>` (replacing `allCases`) and use `casesByModule.get(moduleId) ?? []` internally. The render loop also reads from this map. The unused `state` parameter was removed from `buildCsv` since it no longer calls `filterCasesForModule`.

### WR-05: INFO_DETAIL_MODULES does not include auth — intent not documented

**Files modified:** `src/constants/wizard-config.ts`
**Commit:** eb491f7
**Applied fix:** Added comment above the export: `// auth is a detail trigger for ecommerce only; infosite auth has no sub-options in v1`.

---

_Fixed: 2026-06-07T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
