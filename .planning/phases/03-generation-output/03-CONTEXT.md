# Phase 3: Generation & Output — Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

After completing the wizard, the user sees a complete table of generated test cases grouped by module, and can copy or download them as Markdown, export as CSV for Notion, then restart. All rendering happens in-place inside the existing Wizard component (step 5 replaces the "Готово!" placeholder). No new route needed.

</domain>

<decisions>
## Implementation Decisions

### Results Screen

- **D-01:** Results render **in-place** inside `Wizard.tsx` at step 5 — no navigation to `/results`. `WizardState` is already in memory; no URL params or state transfer required.
- **D-02:** Step 5 replaces the current "Готово!" placeholder with the full results UI (table + action buttons).

### Table Layout — Grouping

- **D-03:** Test cases are **grouped by module** — each selected module appears as a separate block with a heading.
- **D-04:** Group heading format: `"Module Name (N)"` where N = count of cases in that module (e.g., "Кошик (4)").
- **D-05:** Module order in results = **order of user selection** in the wizard (not alphabetical by ID prefix).
- **D-06:** Markdown export (`.md` file) mirrors the UI structure: each module as a `## Module Name (N)` heading followed by its own Markdown table.

### Generation Logic — Detail Filtering

- **D-07:** CheckoutDetails (hasGuestCheckout, hasPromoCode), AuthDetails (hasSocialLogin, hasOrderHistory), SearchDetails (hasAutoComplete, hasFiltersInResults), ContactFormDetails (hasFileUpload, hasCaptcha), MultilangDetails (languageCount) **filter specific test cases** within a module.
- **D-08:** Filtering mechanism: requires each JSON test case to carry a tag/feature marker (e.g., `"tags": ["promo-code"]`). When `hasPromoCode: false`, test cases tagged `"promo-code"` are excluded. Researcher must verify if current JSON files already have tags or if TestCase type and JSON files need extension.
- **D-09:** If a module is selected but no detail answers exist (because user skipped details), **all cases for that module are included**.

### Кроки Format in Exports

- **D-10:** In Markdown table cells: numbered list joined with `<br>` — `1. Крок 1<br>2. Крок 2<br>3. Крок 3`.
- **D-11:** In CSV (Notion export): steps joined with `\n` (newline), field wrapped in double-quotes so Notion imports as multi-line rich text.
- **D-12:** CSV columns (OUT-05): ID, Name, Preconditions, Steps, Expected, Priority, Module. UTF-8 BOM for correct Excel/Notion encoding.

### Claude's Discretion

- Module ID → TC-prefix mapping table location (wizard-config.ts extension vs. separate map file — follow existing patterns).
- Data loading strategy for client component: Server Action vs. pre-loading all cases as props in page.tsx. Given 45 small JSON objects, pre-loading as props is acceptable for v1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §Generation §Output §UI/NFR — GEN-02, OUT-01…OUT-05, UI-01, UI-02 are all Phase 3 requirements
- `.planning/ROADMAP.md` §Phase 3 — goal, success criteria (6 items), UI hint flag

### Type Contracts
- `src/lib/types.ts` — `TestCase` type (Ukrainian field keys: ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет), `WizardState`, `CheckoutDetails`, `AuthDetails`, `SearchDetails`, `ContactFormDetails`, `MultilangDetails`

### Data Loader
- `src/lib/test-cases.ts` — `loadAllTestCases()`, `loadModuleTestCases(prefix)` — uses Node `fs` (server-only); must check all JSON files to build module→prefix mapping

### Wizard Config
- `src/constants/wizard-config.ts` — module IDs (catalog, product, cart, checkout, auth, blog, search, filter, compare, wishlist, contact-form, subscription, gallery, multilang), detail step trigger lists

### JSON Library
- `data/test-cases/` — 10 JSON files, 45 total cases; researcher must read to: (a) verify which TC-prefixes exist, (b) confirm whether `tags` field exists for detail filtering

### Integration Point
- `src/components/wizard/Wizard.tsx` — step 5 branch (lines 93–105) is the injection point for Phase 3 results UI; `WizardNav.tsx` receives `isCompletion={currentStep === 5}` flag

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `loadModuleTestCases(prefix: string)` in `src/lib/test-cases.ts` — ready to use; needs a module-ID→TC-prefix mapping table to call it per selected module
- `toast` from `sonner` — already installed and used in Wizard.tsx; use for "Copied!" confirmation on Copy Markdown action
- shadcn/ui `Button`, `Card`, `Badge` — installed; use for action buttons and result display

### Established Patterns
- Client component pattern: `"use client"` + `useState` (Wizard.tsx is the model)
- Server Component for data: `page.tsx` is a Server Component — acceptable to load all test cases there and pass as props to Wizard (avoids `fs` in client component)
- Tailwind v4 dark theme via `@theme {}` in `globals.css` — `#0a0a0a` bg, `#171717` cards, `#3ecf8e` green accent. No `tailwind.config.ts`
- shadcn 4.10.0: `@import "shadcn/tailwind.css"` alongside tailwindcss — follow Phase 2 import pattern
- Ukrainian-only UI copy (CLAUDE.md constraint)

### Integration Points
- `Wizard.tsx:93–105` — `{currentStep === 5 && ...}` branch: replace placeholder `<div>` with `<ResultsView state={state} allCases={props} />` (or equivalent)
- `page.tsx` — Server Component; extend to pre-load test cases via `loadAllTestCases()` and pass as prop to `<Wizard initialCases={cases} />`
- `WizardNav.tsx` — already handles `isCompletion` flag; check if "Далі" button is hidden at step 5 or replaced — the action buttons (Copy, Download, Restart) belong in the results view, not WizardNav

### Research Note for Planner
- **TC-prefix mapping**: `wizard-config.ts` has module IDs but no TC-prefix mapping. Researcher should check `data/test-cases/` filenames to build the map (e.g., `catalog.json` → `TC-CAT`). TC-CPN (4 cases) — researcher must identify which module maps to this prefix.
- **Tags for detail filtering**: Current `TestCase` type has no `tags` field. If detail filtering (D-07/D-08) requires tags, the type and all 10 JSON files need extending. Researcher should assess effort vs. alternative (hardcoded case-ID exclusion lists).

</code_context>

<specifics>
## Specific Ideas

- Export filename format: `test-cases_{type}_{date}.md` — e.g., `test-cases_ecommerce_2026-06-07.md`
- CSV filename: `test-cases_{type}_{date}.csv` (implied by OUT-05 Notion export intent)
- Sonner toast for Copy Markdown confirmation — already used in Wizard.tsx; consistent pattern
- "Почати заново" (OUT-04) resets WizardState to INITIAL_WIZARD_STATE and returns to step 1

</specifics>

<deferred>
## Deferred Ideas

### Advanced Template System (not Phase 3)
User described 5 TC template types (Basic, Lifecycle, Form+validation, Responsive, Integration) with structured skeletons and a 4-step workflow extension (observe page → propose TCs → verify → adjust). This is a significant new capability — its own phase or product track.

### AI/Notion Workflow Integration (not Phase 3)
Described an AI-assisted TC creation workflow with junior-friendly priority classification (P0/P1/P2), test layer tagging (@smoke, @regression, @security, @a11y), and Notion-native output. Deterministic v1 is the constraint — AI is explicitly out of scope.

### Pre-built TC packages by project type (not Phase 3)
Ready packages for Landing, E-commerce, AI Agent, SaaS Dashboard. Possible v2 extension once the basic generation is validated.

</deferred>

---

*Phase: 3-Generation & Output*
*Context gathered: 2026-06-07*
