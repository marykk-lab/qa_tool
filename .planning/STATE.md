---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 2 — Wizard
current_plan: Phase 2 Plan 01 complete — executing Plan 02
status: ready_to_execute
last_updated: "2026-06-04T22:00:00.000Z"
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 4
  completed_plans: 1
  percent: 33
---

# Project State: QA Test Constructor

*Last updated: 2026-06-04*

---

## Project Reference

**Core Value:** QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.
**Stack:** Next.js 16 + Tailwind CSS v4, client+server components, JSON data files
**Deployment:** Vercel (live, server-capable deploy mode)

---

## Current Position

**Current Phase:** 2 — Wizard
**Current Plan:** Plan 02 (Test-case JSON library) — Plan 01 complete
**Phase Status:** Executing ✓
**Overall Status:** Phase 2 executing — 1/3 plans complete

```
Progress: [████░░░░░░] 40% (1/3 phases complete, Phase 2 in progress)
```

---

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | Complete ✓ |
| 2 | Wizard | Planned ✓ |
| 3 | Generation & Output | Not started |

---

## Performance Metrics

- Plans executed: 2
- Phases complete: 1/3
- Requirements mapped: 19/19
- Requirements delivered: 4/19 (WIZ-08, WIZ-09, UI-03, GEN-01 — delivered by Phase 2 Plan 01)

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

### Phase 2 Pre-Planning Notes (from task spec review)

- Platform step (WooCommerce/Shopify/WordPress/Інша) not in current requirements — decision needed before planning
- CSV/Notion export not in current OUT requirements — decision needed
- shadcn/ui was excluded in Phase 1 (T-01-SC); Phase 2 may need UI components — revisit
- Dark theme is now fully specified (#0a0a0a / #171717 / #3ecf8e) — unblocks Phase 3

### Active Todos

- Decide: add Platform step to Phase 2 wizard? (from task spec, not in current REQUIREMENTS)
- Decide: add CSV/Notion export to Phase 3? (from task spec, not in current OUT requirements)
- Update REQUIREMENTS.md before Phase 2 planning if above decisions are yes

### Blockers

- None currently

### Notes

- Phase 1 is pure scaffold (no v1 requirement IDs — it enables all downstream phases)
- GEN-01, GEN-03, GEN-04 are in Phase 2 because the JSON library structure must be established alongside the wizard
- UI-01 depends on Feedboon style reference — now available (image.png confirmed)

---

## Session Continuity

**To resume:** Run `/gsd:execute-phase 2` to execute Plan 02 (test-case JSON library).

**Context for next session:**

- Phase 2 Plan 01 complete: shadcn/ui installed (8 components), Feedboon dark theme applied, WizardState types + wizard-config helpers + array-aware loader established
- Phase 2 Plan 02 = test-case JSON library (10 module files with correct ID prefixes)
- Phase 2 Plan 03 = wizard vertical slice (5 step components, navigation, page wiring)
- shadcn components are base-nova preset but functionally identical to new-york
- WizardState contract: src/lib/types.ts; platform/module config: src/constants/wizard-config.ts
