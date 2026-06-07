# Roadmap: QA Test Constructor

**Project:** QA Test Constructor
**Core Value:** QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.
**Granularity:** Coarse
**Total v1 Requirements:** 22
**Coverage:** 22/22 ✓

---

## Phases

- [x] **Phase 1: Foundation** - Next.js + Tailwind scaffold, project structure, JSON library skeleton, Vercel deployment config
- [x] **Phase 2: Wizard** - Full multi-step question flow for both project types with navigation, progress indicator, and test case JSON library
- [x] **Phase 3: Generation & Output** - Deterministic case generation, result table, Markdown export actions, Feedboon styling, tablet layout

---

## Phase Details

### Phase 1: Foundation
**Goal**: A deployable Next.js + Tailwind project exists with the correct folder structure, JSON data conventions established, and Vercel deployment confirmed working.
**Mode:** mvp
**Depends on**: Nothing
**Requirements**: (none from v1 list — pure scaffold enabling all downstream phases)
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts the app locally without errors and shows a placeholder page
  2. Vercel deployment succeeds from the repository (or local export) and the placeholder page is accessible via URL
  3. `/data/test-cases/` directory exists with at least one sample JSON file following the agreed schema (ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет)
  4. Tailwind CSS is configured and a sample element renders with Tailwind classes correctly
**Plans**: 1 plan
  - [~] 01-PLAN-01.md — Walking Skeleton: Next.js + Tailwind scaffold, JSON data layer read/render, Vercel deploy (Tasks 1-2 done, Task 3 awaiting human deploy)

### Phase 2: Wizard
**Goal**: A user can navigate the full multi-step wizard for both project types, make all selections, and reach the final step with their choices preserved.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: WIZ-01, WIZ-02, WIZ-03, WIZ-04, WIZ-05, WIZ-06, WIZ-07, WIZ-08, WIZ-09, GEN-01, GEN-03, GEN-04, UI-03
**Success Criteria** (what must be TRUE):
  1. User selects "E-commerce" or "Інформаційний сайт" on step 1 and the correct branch of questions follows
  2. User can select the platform (WooCommerce/Shopify/Інша for E-commerce; WordPress/Інша for Інфо-сайт) on step 2
  3. User can select multiple modules from the correct list (10 for E-commerce, 7 for Інформаційний сайт) and detail sub-questions appear only for qualifying modules (Checkout / Особистий кабінет / Пошук for E-commerce; Контактна форма / Багатомовність for Інформаційний сайт)
  4. "Назад" returns to the previous step with all prior selections intact; "Далі" only advances when required selections are made
  5. The progress indicator ("Крок N з M") updates correctly on every step
  6. JSON library files in `/data/test-cases/` are populated with full test case objects using correct ID prefixes (TC-CAT, TC-PDP, TC-CART, TC-CHK, TC-AUTH, TC-SRCH, TC-BLOG, TC-FORM, TC-LANG, TC-CPN)
  7. shadcn/ui components (Button, Card, Badge, Checkbox, RadioGroup, Progress, Sonner) are installed and used throughout the wizard
**Plans**: 3 plans
  **Wave 1:**
  - [x] 02-01-PLAN.md — Foundation: shadcn/ui install, Feedboon dark theme, WizardState types + config, array-aware loader, RED tests
  **Wave 2** *(blocked on Wave 1 completion)*:
  - [x] 02-02-PLAN.md — Test-case JSON library: 10 module files with correct ID prefixes + schema/prefix loader test
  - [x] 02-03-PLAN.md — Wizard vertical slice: 5 step components, navigation/progress, Sonner toasts, page wiring

  **Cross-cutting constraints:**
  - `hasDetailStep(state)` must be called in `handleNext()` — step 4 skip is mandatory (WIZ-04, WIZ-07)
  - All UI copy must be Ukrainian only (CLAUDE.md constraint)
  - `dangerouslySetInnerHTML` must never be used in any wizard component
**UI hint**: yes

### Phase 3: Generation & Output
**Goal**: After completing the wizard, the user sees a complete table of generated test cases and can copy or download it as Markdown, then restart.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: GEN-02, OUT-01, OUT-02, OUT-03, OUT-04, OUT-05, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. The result screen displays a table of all test cases matching the user's module selections, with correct columns (ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет)
  2. "Copy Markdown" copies a valid Markdown table to the clipboard and the user sees a confirmation (Sonner toast)
  3. "Download .md" downloads a file named `test-cases_{type}_{date}.md` containing the same Markdown table
  4. "Export to Notion (.csv)" downloads a UTF-8 CSV file with columns ID, Name, Preconditions, Steps, Expected, Priority, Module — importable into Notion as a database
  5. "Почати заново" resets all state and returns to step 1 of the wizard
  6. The UI applies the Feedboon dark theme: `#0a0a0a` background, `#171717` cards, `#3ecf8e` green accent, light text; renders correctly on desktop and tablet (≥768px)
**Plans**: 2 plans
  **Wave 1:**
  - [x] 03-01-PLAN.md — Config + wiring: MODULE_TC_PREFIXES/DISPLAY_NAMES/PROMO constants, async page.tsx data load, Wizard initialCases prop, WizardNav isCompletion fix
  **Wave 2** *(blocked on Wave 1 completion)*:
  - [x] 03-02-PLAN.md — Results components: PriorityBadge, ResultsView (generation logic, grouped table, action buttons, exports), Wizard step 5 wiring
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2026-06-04 |
| 2. Wizard | 3/3 | Complete | 2026-06-07 |
| 3. Generation & Output | 2/2 | Complete | 2026-06-07 |

---

## Coverage Map

| Requirement | Phase |
|-------------|-------|
| WIZ-01 | Phase 2 |
| WIZ-02 | Phase 2 |
| WIZ-03 | Phase 2 |
| WIZ-04 | Phase 2 |
| WIZ-05 | Phase 2 |
| WIZ-06 | Phase 2 |
| WIZ-07 | Phase 2 |
| WIZ-08 | Phase 2 |
| WIZ-09 | Phase 2 |
| GEN-01 | Phase 2 |
| GEN-02 | Phase 3 |
| GEN-03 | Phase 2 |
| GEN-04 | Phase 2 |
| OUT-01 | Phase 3 |
| OUT-02 | Phase 3 |
| OUT-03 | Phase 3 |
| OUT-04 | Phase 3 |
| OUT-05 | Phase 3 |
| UI-01 | Phase 3 |
| UI-02 | Phase 3 |

**Mapped:** 19/19 ✓ (Phase 1 is pure scaffold with no assigned requirement IDs)

---

*Roadmap created: 2026-06-04*
