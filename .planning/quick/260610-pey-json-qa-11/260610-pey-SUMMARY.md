---
phase: quick
plan: 260610-pey
subsystem: test-case-schema
tags: [schema, json-migration, export-format, ui-table]
dependency_graph:
  requires: []
  provides: [11-col-markdown-export, testcase-schema-v2]
  affects: [src/lib/types.ts, src/components/wizard/ResultsView.tsx, data/test-cases/*.json]
tech_stack:
  added: []
  patterns: [single-flat-markdown-table, render-time-numbering]
key_files:
  created: []
  modified:
    - src/lib/types.ts
    - src/components/wizard/ResultsView.tsx
    - data/test-cases/auth.json
    - data/test-cases/blog.json
    - data/test-cases/cart.json
    - data/test-cases/catalog.json
    - data/test-cases/checkout.json
    - data/test-cases/contact-form.json
    - data/test-cases/coupons.json
    - data/test-cases/multilang.json
    - data/test-cases/product.json
    - data/test-cases/search.json
decisions:
  - "Step numbering removed from JSON; added at render time via ${i+1}. — single source of truth, eliminates double-numbering"
  - "Layer union narrowed to Smoke|Regression in types.ts; all 15 Feature occurrences across 10 JSONs → Regression"
  - "buildMarkdown no longer accepts state parameter — projectTypeLabel/todayISO removed (not needed for single flat table)"
metrics:
  duration: "~35 min"
  completed: "2026-06-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 12
---

# Quick Task 260610-pey: JSON Schema + 11-Column QA Table Summary

**One-liner:** Migrated TestCase schema to 11-column spec (added «Тестові дані», narrowed Layer to Smoke|Regression) and rewrote ResultsView export/render to produce a single flat Markdown table with no double-numbering.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update TestCase schema + rewrite ResultsView to 11 columns | e4ab4c3 | src/lib/types.ts, src/components/wizard/ResultsView.tsx |
| 2 | Migrate all 10 JSON files to new schema | 0a5c13b | data/test-cases/*.json (10 files) |

---

## What Was Built

### Task 1: Schema + ResultsView

**src/lib/types.ts:**
- Added `"Тестові дані": string` field after `"Очікуваний результат"` with JSDoc documenting concrete values or «—»
- Narrowed `Layer` union from `"Smoke" | "Regression" | "Feature"` to `"Smoke" | "Regression"` (removed Feature)
- `Feature?: string` optional tag untouched (used by filterCasesForModule)

**src/components/wizard/ResultsView.tsx:**
- `buildMarkdown`: rewritten to produce a single flat table starting immediately with the header row (no `# Результати…` heading, no `## suiteName` sections). Suite becomes the first cell in every data row. Exactly 11 columns in spec order: Suite, Test Case, Priority, Status, Preconditions, Steps, Expected Result, Test Data, Test Layer, Test Type, Last Verified. Last Verified is an empty cell. Removed unused `state` parameter, `projectTypeLabel`, `todayISO`.
- `buildCsv`: same 11-column header and row order. Steps joined with `\n` (newlines inside CSV cell). BOM preserved. Last Verified: empty cell.
- `handleCopyRow`: same 11-column format with `${i+1}.` step numbering and empty Last Verified.
- UI table: added Test Data, Test Layer, Test Type columns. Step numbering added in render: `{i + 1}. {step}` (JSON now stores clean steps). Last Verified is an empty `<td>`. Column heading for first column changed to "Test Case".

### Task 2: JSON Migration (10 files, 62 test cases)

- **Step prefixes removed:** All `"1. Відкрити…"` → `"Відкрити…"` etc. Verified: 0 step prefixes remaining.
- **Layer=Feature → Regression:** auth-006, auth-007, blog-005, cart-005, cart-006, catalog-006, checkout-007, checkout-008, contact-form-005, contact-form-006, coupons-005, multilang-005, product-006, search-005, search-006 (15 cases).
- **«Тестові дані» field added:** Every case now has concrete realistic test data in Ukrainian (emails like `qa.user@example.com`, UAH amounts like `1 250 грн`, dates like `15.07.2026`, promo codes like `SAVE15`, etc.). Cases with no data input use «—».
- **Placeholders replaced:** `{registered_email}` → `qa.user@example.com`, `{valid_password}` → `SecurePass!23`, `{min_password_length}` → `8`, `{non_numeric_input}` → `«abc»`, `{xss_payload}` → `script alert(1) /script`, `{valid_coupon_code}` → `SAVE15`, `{expired_coupon_code}` → `EXPIRED2024`, `{min_order_amount}` → `500 грн`, `{non_default_language}` → `English`, etc.
- **Pipe characters:** blog-004 had `<title>` and `<meta name='description'>` HTML tags; angle brackets kept, no `|` characters. contact-form step uses `«»` not `|`. Verified: 0 pipe chars.
- **JSON validity:** All 10 files parse without error.

---

## Automated Verification Results

```
npx tsc --noEmit   →  (no output = 0 errors)

node -e [json-invariant-check]
Layer=Feature: 0 | missing ТестовіДані: 0 | step prefixes: 0 | pipe chars: 0
ALL JSON OK
```

Both checks pass on final state (after both commits).

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes on User's Uncommitted Changes

Per plan constraints, the user's uncommitted edits in `ResultsView.tsx` were included in the Task 1 commit (e4ab4c3) since the plan task explicitly modifies the same file. `StepModules.tsx`, `WizardNav.tsx`, and `.planning/REQUIREMENTS.md` were not staged (not modified by this plan).

---

## Known Stubs

None — all «Тестові дані» fields contain concrete values or explicit «—» (no placeholder text, no empty strings).

---

## Checkpoint: Human Verify

**Task 3 is a `checkpoint:human-verify`.**

### Automated checks (completed above):

- `npx tsc --noEmit`: PASSED (0 errors)
- JSON invariant script: PASSED (ALL JSON OK)

### Human verification required:

1. Run `npm run dev` in `C:\folder1\qa_app`
2. Open http://localhost:3000, complete the wizard to the results screen (select several modules)
3. Verify UI table: steps are numbered exactly once (1. 2. 3.), columns Test Data / Test Layer / Test Type are visible, Last Verified is empty
4. Click «Скопіювати Markdown»: paste into editor — must show EXACTLY ONE table with header `| Suite | Test Case | Priority | Status | Preconditions | Steps | Expected Result | Test Data | Test Layer | Test Type | Last Verified |`, no text before or after, Suite in first column of every row
5. Download `.md` and `.csv` — verify same 11 columns in same order; CSV opens in Notion/Excel with Cyrillic (BOM present)
6. Verify test data is concrete (emails/amounts/dates), not placeholder `{…}` syntax

---

## Self-Check

- [x] src/lib/types.ts exists and contains «Тестові дані» field
- [x] src/components/wizard/ResultsView.tsx exists and buildMarkdown generates single flat table
- [x] All 10 JSON files exist and pass invariant checks
- [x] Commit e4ab4c3 exists (Task 1)
- [x] Commit 0a5c13b exists (Task 2)
- [x] tsc --noEmit: 0 errors
- [x] JSON invariant script: ALL JSON OK

## Self-Check: PASSED
