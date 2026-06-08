---
phase: 04-ai-wizard-substeps
plan: "03"
subsystem: results-view
tags: [results-table, priority-badge, suite-grouping, markdown-export, csv-export, typescript]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [7-column-suite-grouped-table, expanded-priority-badges, updated-markdown-export, updated-csv-export]
  affects: [src/components/wizard/PriorityBadge.tsx, src/components/wizard/ResultsView.tsx]
tech_stack:
  added: []
  patterns: [collapsible-suite-groups, row-hover-icons, suite-map-grouping, sanitize-pipe-chars]
key_files:
  created: []
  modified:
    - src/components/wizard/PriorityBadge.tsx
    - src/components/wizard/ResultsView.tsx
decisions:
  - "PRIORITY_LABELS map added to PriorityBadge: P0→'P0 Critical', P1→'P1 Important', P2→'P2 Nice to have'"
  - "Suite grouping uses tc.Suite field (not moduleId); suiteMap derived in component body before return"
  - "collapsedSuites: Set<string> initialized to empty (all expanded by default per D-18)"
  - "buildMarkdown uses ## SuiteName headers (no case count) and sanitize() to replace | with /"
  - "buildCsv 7-column schema: Title,Steps,Expected Result,Preconditions,Priority,Status,Last Verified"
  - "Worktree pre-merge of main (Plan 01+02 changes) applied as chore commit before task commits"
metrics:
  duration: "243s"
  completed_date: "2026-06-08"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 2
---

# Phase 4 Plan 03: Output Table Overhaul Summary

7-column Feedboon-format results table with Suite-based collapsible grouping, expanded PriorityBadge labels (P0 Critical / P1 Important / P2 Nice to have), row hover icons, and updated Markdown/CSV exports grouped by Suite with correct column schema.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update PriorityBadge to show expanded labels | 91a1ba7 | src/components/wizard/PriorityBadge.tsx |
| 2 | Overhaul ResultsView table to 7-column Suite-grouped layout | 25ddc8a | src/components/wizard/ResultsView.tsx |
| 3 | Update buildMarkdown and buildCsv to new 7-column Suite-grouped schema | 25ddc8a | src/components/wizard/ResultsView.tsx |

## Decisions Made

- `PRIORITY_LABELS` constant added to `PriorityBadge.tsx`: P0→"P0 Critical", P1→"P1 Important", P2→"P2 Nice to have". Badge text and aria-label both use expanded label. Colors (red/yellow/grey) unchanged.
- Suite grouping in the results table uses `tc.Suite` field directly. The `suiteMap` is derived in the component body (not `useMemo`) by iterating `filteredModules` and `casesByModule`.
- `collapsedSuites: Set<string>` initialized to `new Set()` — all suites expanded by default (D-18).
- Collapsing a suite hides the table via conditional render `{!isCollapsed && ...}`. The Suite header button toggles the Set.
- Row hover icons (Trash2, Copy, ExternalLink from lucide-react) are visual only — no onClick handlers per D-19/T-04-07.
- `buildMarkdown` emits `## SuiteName` (without case count) then 7-column pipe table. `sanitize()` replaces `|` with `/` in all cell values (T-04-05 mitigation).
- `buildCsv` 7-column header: `Title,Steps,Expected Result,Preconditions,Priority,Status,Last Verified`. ID, Type, Layer, Module columns removed. `escapeCell()` wraps all values in double-quotes with doubled internal quotes (T-04-06 RFC 4180 mitigation).
- Tasks 2 and 3 were combined into a single commit since both affect `ResultsView.tsx` and were written atomically.
- Prerequisite merge of main (Plan 01+02 commits) done as a `chore` commit before task commits — this worktree was created before Plan 01/02 executed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree missing Plan 01+02 changes**
- **Found during:** Task 1 pre-check (reading worktree files)
- **Issue:** This worktree was spawned before Plans 01 and 02 executed on the main branch. The worktree had: old `types.ts` (no `Feature?` or `moduleFeatures`), old 3-parameter `filterCasesForModule`, old JSON files without Feature fields, and old wizard-config.ts without `MODULE_FEATURES` or updated `getTotalSteps`.
- **Fix:** Ran `git merge main --no-commit --no-ff` (resolved cleanly), then committed the merge as a `chore(04-03)` commit before any task work.
- **Files modified:** All Plan 01+02 changed files merged in (types.ts, wizard-config.ts, Wizard.tsx, WizardNav.tsx, StepModuleFeatures.tsx, all 10 JSON files, ResultsView.tsx, planning docs)
- **Commit:** 389c4c7

## Known Stubs

None — all columns are fully wired (Status and Last Verified are intentionally hardcoded as "Not started" and "—" per D-15/D-16; this is spec behavior, not a stub).

## Threat Flags

No new security-relevant surface introduced. Threat mitigations T-04-05 (sanitize |→/) and T-04-06 (escapeCell RFC 4180) implemented as required by the plan's threat register.

## Self-Check: PASSED

- src/components/wizard/PriorityBadge.tsx: FOUND, contains "P0 Critical"
- src/components/wizard/ResultsView.tsx: FOUND, contains "Last Verified"
- ResultsView renders 7 columns: Title, Steps, Expected Result, Preconditions, Priority, Status, Last Verified
- No ID column in rendered table
- collapsedSuites useState present
- ChevronDown/ChevronRight imports from lucide-react present
- Trash2, Copy, ExternalLink row hover icons present
- buildMarkdown: ## Suite grouping, sanitize() present, 7-column header
- buildCsv: 7-column header "Title,Steps,Expected Result,Preconditions,Priority,Status,Last Verified"
- Commits 91a1ba7, 25ddc8a: FOUND in git log
- TypeScript: 0 errors (npx tsc --noEmit)
