---
phase: 02-wizard
plan: 02
subsystem: test-case-library
tags: [json-data, test-cases, tdd, gen-01, gen-03, gen-04]
dependency_graph:
  requires: [02-01]
  provides: [test-case-json-library, id-prefix-validation, schema-validation]
  affects: [02-03, 03-*]
tech_stack:
  added: []
  patterns:
    - Ten per-module JSON arrays in data/test-cases/ following TestCase schema
    - Zero-padded sequential IDs per file (TC-{PREFIX}-{NNN})
    - loadAllTestCases() flattens all array files; schema/prefix tests on flattened set
    - Migrated legacy getSampleTestCase tests to use loadAllTestCases + ID lookup
key_files:
  created:
    - data/test-cases/catalog.json
    - data/test-cases/product.json
    - data/test-cases/cart.json
    - data/test-cases/checkout.json
    - data/test-cases/auth.json
    - data/test-cases/search.json
    - data/test-cases/blog.json
    - data/test-cases/contact-form.json
    - data/test-cases/multilang.json
    - data/test-cases/coupons.json
  modified:
    - src/__tests__/test-cases.test.ts
  deleted:
    - data/test-cases/sample.json
decisions:
  - sample.json deleted and TC-CAT-001 migrated to catalog.json first entry — prevents duplicate in loadAllTestCases output (RESEARCH.md A6)
  - getSampleTestCase() tests migrated to use loadAllTestCases() + ID lookup rather than fixing sample.json reference — keeps test suite meaningful post-deletion
  - Each prefix gets individual test assertion plus combined "all 10 prefixes" test for clarity
metrics:
  duration: ~15 minutes
  completed: 2026-06-04
  tasks_completed: 2/2
  files_created: 10
  files_modified: 1
  files_deleted: 1
  tests_added: 16
  tests_total: 46
---

# Phase 2 Plan 02: Test-Case JSON Library

**One-liner:** Ten per-module JSON arrays authored with Ukrainian QA content and correct TC-{PREFIX}-NNN IDs; schema + ID-prefix loader tests added; suite green at 46/46.

---

## Summary

This plan built the deterministic test-case library that Phase 3 generation will draw from:

1. **Task 1 (JSON authoring):** Created 10 JSON files in `data/test-cases/`, each a JSON array of `TestCase` objects with realistic Ukrainian-language content. TC-CAT-001 from `sample.json` was migrated as the first entry in `catalog.json`, then `sample.json` was deleted to eliminate the duplicate.

2. **Task 2 (TDD test extension):** Updated `src/__tests__/test-cases.test.ts` — migrated the 6 existing `getSampleTestCase` tests to use `loadAllTestCases()` + ID lookup (since `sample.json` is gone), and added a new describe block that asserts count >= 40, six-field schema presence, valid Пріоритет, all 10 ID prefixes covered, and uniqueness across the full flattened set.

---

## Completed Tasks

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Author ten module JSON files and remove sample.json | 9bdcb4c | data/test-cases/{catalog,product,cart,checkout,auth,search,blog,contact-form,multilang,coupons}.json; delete sample.json |
| 2 | Extend test-cases.test.ts with schema + ID-prefix validation | cde643e | src/__tests__/test-cases.test.ts |

---

## Module Coverage

| File | Prefix | Count | Priority Distribution |
|------|--------|-------|-----------------------|
| catalog.json | TC-CAT | 5 | High×3, Medium×2 |
| product.json | TC-PDP | 5 | High×3, Medium×1, Low×1 |
| cart.json | TC-CART | 4 | High×3, Medium×1 |
| checkout.json | TC-CHK | 6 | High×4, Medium×2 |
| auth.json | TC-AUTH | 5 | High×4, Medium×1 |
| search.json | TC-SRCH | 4 | High×1, Medium×2, Low×1 |
| blog.json | TC-BLOG | 4 | Medium×2, Low×2 |
| contact-form.json | TC-FORM | 4 | High×2, Medium×2 |
| multilang.json | TC-LANG | 4 | High×2, Medium×2 |
| coupons.json | TC-CPN | 4 | High×2, Medium×1, Low×1 |
| **Total** | — | **45** | — |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migrated getSampleTestCase tests to avoid deleted sample.json**

- **Found during:** Task 2
- **Issue:** The existing 6 tests in `test-cases.test.ts` called `getSampleTestCase()` which reads `sample.json`. After Task 1 deleted `sample.json`, those tests would throw a file-not-found error.
- **Fix:** Replaced `getSampleTestCase()` calls with `loadAllTestCases().find(tc => tc.ID === 'TC-CAT-001')` — this retrieves the same first catalog entry from `catalog.json` via the array-aware loader, keeping all 6 existing assertions valid.
- **Files modified:** `src/__tests__/test-cases.test.ts`
- **Commit:** cde643e

---

## Verification Results

```
npm test: 4 suites, 46 tests — ALL PASSED
node verification script: OK — all 10 files valid, sample.json absent
```

### Acceptance Criteria Check

- [x] data/test-cases/sample.json does NOT exist
- [x] All ten JSON files exist as arrays of length >= 4 (45 total test cases)
- [x] Every ID in catalog.json starts with TC-CAT; checkout.json with TC-CHK; coupons.json with TC-CPN (and so on per the mapping)
- [x] Every object has all six keys; Кроки is a non-empty array; Пріоритет is exactly High, Medium, or Low
- [x] src/__tests__/test-cases.test.ts contains "TC-CHK" (prefix coverage assertion)
- [x] Test asserts loadAllTestCases().length >= 40 (actual: 45)
- [x] Test asserts ID uniqueness (all 45 IDs unique)
- [x] Test asserts six-field schema presence for every case
- [x] npm test exits 0 (46 tests, 4 suites, all pass)

---

## Known Stubs

None — all 10 JSON files contain complete, non-placeholder Ukrainian-language content. All IDs are properly sequenced and prefixed. No stubs exist that would prevent Phase 3 generation from drawing from this library.

---

## Threat Flags

No new threat surface introduced. JSON files are in-repo static data (T-02-04 — accepted, not user-supplied). Content renders as text only in Phase 3 (T-02-03 mitigated by plan, enforced in Plan 03).

---

## Self-Check: PASSED

- data/test-cases/catalog.json: FOUND
- data/test-cases/product.json: FOUND
- data/test-cases/cart.json: FOUND
- data/test-cases/checkout.json: FOUND
- data/test-cases/auth.json: FOUND
- data/test-cases/search.json: FOUND
- data/test-cases/blog.json: FOUND
- data/test-cases/contact-form.json: FOUND
- data/test-cases/multilang.json: FOUND
- data/test-cases/coupons.json: FOUND
- data/test-cases/sample.json: CONFIRMED ABSENT
- src/__tests__/test-cases.test.ts: FOUND (contains "TC-CHK")
- Commit 9bdcb4c: FOUND
- Commit cde643e: FOUND
- npm test: 46/46 passed
