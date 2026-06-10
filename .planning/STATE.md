---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
current_phase: 4 — Wizard Sub-steps & Feature Filtering
current_plan: all complete
status: Phase 4 Complete
last_updated: "2026-06-08T14:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 9
  completed_plans: 9
  percent: 100
---

# Project State: QA Test Constructor

*Last updated: 2026-06-10 — Completed quick task 260610-pey: тест-кейси та експорт приведені до 11-колонкової QA-таблиці*

---

## Project Reference

**Core Value:** QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.
**Stack:** Next.js 16 + Tailwind CSS v4, client+server components, JSON data files
**Deployment:** Vercel (live, server-capable deploy mode)

---

## Current Position

**Current Phase:** 4 — Wizard Sub-steps & Feature Filtering
**Current Plan:** Not started — needs `/gsd-plan-phase 4`
**Phase Status:** Planned (task spec in `.planning/phases/04-ai-wizard-substeps/04-TASK-SPEC.md`)
**Overall Status:** Phases 1–3 complete (v1.0 shipped). Phase 4 adds dynamic module sub-steps + feature-based JSON filtering + Feedboon output table format. Still deterministic — no AI/backend.

```
Progress: [██████████░░░] 75% (3/4 phases complete, Phase 4 not started)
```

---

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | Complete ✓ |
| 2 | Wizard | Complete ✓ |
| 3 | Generation & Output | Complete ✓ |
| 4 | Wizard Sub-steps & Feature Filtering | Planned — needs `/gsd-plan-phase 4` |

---

## Performance Metrics

- Plans executed: 4 (3 phases × plans)
- Phases complete: 2/3
- Requirements mapped: 19/19
- Requirements delivered: 19/19 (Phase 2 complete — WIZ-01…09, GEN-01, GEN-03, GEN-04, UI-03 all done)

---

## Accumulated Context

### Key Decisions

- Next.js + Tailwind — matches Feedboon stack for future integration
- All logic client-side, no backend
- Test case library in `/data/test-cases/*.json` — editable without recompile
- Deterministic generation only (no AI)
- UI language: Ukrainian only (v1)
- Tailwind v4 used (create-next-app default) — `@import "tailwindcss"` syntax, no tailwind.config.ts; Phase 3 theme uses `@theme {}` blocks
- TestCase type uses Ukrainian field names as keys (Назва, Кроки, etc.) matching GEN-03
- JSON read via Node fs in server context for QA-editable JSON without recompile
- Next.js default Vercel deploy mode (server-capable), not static export
- Feedboon design reference confirmed: dark `#0a0a0a` bg / `#171717` cards / `#3ecf8e` green accent
- shadcn 4.10.0 base-nova preset used (new-york style renamed/removed in this version)
- shadcn 4.10.0 requires @import "shadcn/tailwind.css" alongside tailwindcss and tw-animate-css
- Feedboon dark theme in unconditional :root (oklch values) — no light mode toggle
- MultilangDetails.languageCount as "2"|"3"|"4plus" string literal union (RadioGroup value compatibility)
- WizardState is ephemeral per-session (useState, no persistence) — no routing or global store needed
- sample.json deleted; TC-CAT-001 migrated to catalog.json first entry — prevents duplicate TC-CAT-001 in loadAllTestCases output
- Each module gets its own JSON file with per-module ID prefix; 45 total test cases authored (Plan 02)

### Phase 2 Pre-Planning Notes (from task spec review)

- Platform step (WooCommerce/Shopify/WordPress/Інша) not in current requirements — decision needed before planning
- CSV/Notion export not in current OUT requirements — decision needed
- shadcn/ui was excluded in Phase 1 (T-01-SC); Phase 2 may need UI components — revisit
- Dark theme is now fully specified (#0a0a0a / #171717 / #3ecf8e) — unblocks Phase 3

### Active Todos

- Decide: add CSV/Notion export to Phase 3? (from task spec — OUT requirements include it now per ROADMAP)

### Blockers

- None currently

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260610-pey | Привести формат тест-кейсів у JSON та експорт до нової QA-таблиці (11 колонок) | 2026-06-10 | 0a5c13b | [260610-pey-json-qa-11](./quick/260610-pey-json-qa-11/) |
| fast | Розширити таблицю результатів — всі колонки без горизонтального скролу | 2026-06-10 | 8237e75 | — |
| fast | Компактна таблиця результатів — менший шрифт і відступи рядків | 2026-06-10 | bd36b8f | — |

### Notes

- Phase 1 is pure scaffold (no v1 requirement IDs — it enables all downstream phases)
- GEN-01, GEN-03, GEN-04 are in Phase 2 because the JSON library structure must be established alongside the wizard
- UI-01 depends on Feedboon style reference — now available (image.png confirmed)

---

## Session Continuity

**To resume:** Run `/gsd-plan-phase 4` to plan Phase 4 (AI Wizard Sub-steps & AI Generation). Task spec is at `.planning/phases/04-ai-wizard-substeps/04-TASK-SPEC.md`.

**Context for next session:**

- Phase 2 fully complete (all 3 plans done, human-verified)
- Wizard: src/components/wizard/Wizard.tsx owns all state; five step components under src/components/wizard/
- WizardState contract: src/lib/types.ts; config helpers: src/constants/wizard-config.ts
- JSON library: data/test-cases/ (10 files, 45 test cases); loader: src/lib/test-cases.ts
- Phase 3 entry point: wire the "Готово — перейти до результатів" button in Wizard.tsx to navigate to a results page
- Full-row click pattern established: onClick on row div + stopPropagation on inner Radix control
- Test case IDs: TC-CAT (5), TC-PDP (5), TC-CART (4), TC-CHK (6), TC-AUTH (5), TC-SRCH (4), TC-BLOG (4), TC-FORM (4), TC-LANG (4), TC-CPN (4) — 45 total
