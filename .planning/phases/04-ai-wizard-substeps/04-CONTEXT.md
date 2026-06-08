# Phase 4: Wizard Sub-steps & Feature Filtering — Context

**Gathered:** 2026-06-08
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/phases/04-ai-wizard-substeps/04-TASK-SPEC.md)

<domain>
## Phase Boundary

Phase 4 adds three layered enhancements to the existing wizard + results flow:

1. **Dynamic module sub-steps** — after step 3 (module selection), one sub-step per selected module is inserted dynamically. Each sub-step title is "{Module name} — що є в модулі?" and contains a multi-select feature checklist. The step counter becomes dynamic: total = 3 base + N selected modules.

2. **Feature-based JSON filtering** — each test case JSON entry gains an optional `"Feature"` string field. Generation filters entries by which features were checked in that module's sub-step. Fallback: entries without `"Feature"` always included; 0 features checked → include all.

3. **Updated output table** — 7 Feedboon-format columns replace the old 8-column schema. Results are grouped by Suite with collapsible headers. Priority renders as a colored badge. Markdown export uses `## SuiteName` headers, no `|` in cells.

No new dependencies, no backend, no AI — pure client-side deterministic logic.

</domain>

<decisions>
## Implementation Decisions

### Task 1 — Dynamic Sub-steps

- **D-01**: After step 3 completes, dynamically insert one sub-step per selected module. Sub-step index = 4 + moduleIndex in the selected order.
- **D-02**: Sub-step title format: `{Module display name} — що є в модулі?`
- **D-03**: Step counter formula: `totalSteps = 3 + state.modules.length`. `getTotalSteps()` in `wizard-config.ts` must be updated to reflect this.
- **D-04**: Going back from step 3 and unchecking a module removes its sub-step; counter updates immediately (re-derives from `state.modules.length`).
- **D-05**: Selecting 0 modules → 0 sub-steps → wizard works as before (no sub-step content shown).
- **D-06**: `WizardState` must gain a new field `moduleFeatures: Record<string, string[]>` to track checked features per module. Value is array of selected feature strings. Default: `{}`.
- **D-07**: New component `StepModuleFeatures` renders the feature checklist for a given module. It receives `moduleId`, `features: string[]` (checklist items), and `selected: string[]` (currently checked) + `onChange: (v: string[]) => void`.
- **D-08**: Feature checklist items per module are defined in `wizard-config.ts` as `MODULE_FEATURES: Record<string, string[]>` (see feature lists below).
- **D-09**: Wizard step routing: steps 1–3 remain fixed; steps 4 through `3 + N` map to module sub-steps (by index); all-features-done step becomes `3 + N + 1` (completion/results). Old step 4 (details) still exists but now occupies a dynamic slot only for the modules that need detail questions.

**Feature Checklist Values (exact strings for MODULE_FEATURES in wizard-config.ts):**

- `catalog`: список товарів із пагінацією, фільтрація за категорією, сортування (ціна/назва/новизна), пошук у каталозі, картка товару в списку (фото/ціна/назва), значок «Немає в наявності», швидкий перегляд товару, порівняння товарів, нескінченний скрол / кнопка «Завантажити ще», теги та мітки (новинка/акція/хіт)
- `product`: назва/ціна/опис/фото, галерея зображень, вибір варіанту (розмір/колір), кількість товару, кнопка «Додати до кошика», кнопка «Купити зараз», блок «Схожі товари», відгуки та рейтинг, вкладки (опис/характеристики/відгуки), відеоогляд товару, наявність на складі, SEO-метадані
- `cart`: перегляд вмісту кошика, зміна кількості, видалення товару, збереження кошика після перезавантаження, міні-кошик у шапці, порожній кошик (стан), перехід до оформлення
- `checkout`: форма доставки, форма оплати, вибір способу доставки, вибір способу оплати, застосування промокоду, підсумок замовлення, гостьове оформлення, підтвердження замовлення (email), відмова платежу
- `auth`: реєстрація, вхід, вихід, відновлення пароля, валідація полів, вхід через соцмережі, особистий кабінет, історія замовлень, редагування профілю
- `search`: пошук за точною назвою, результат «нічого не знайдено», автодоповнення, пошук з фільтрами, пошук одним символом, пошук з максимальною довжиною запиту
- `blog`: список статей із пагінацією, сторінка окремої статті, категорії/рубрики, теги, пошук по блогу, фільтрація/сортування статей, коментарі, поділитися в соцмережах, схожі/рекомендовані статті, RSS-стрічка, автор статті, дата публікації, прев'ю/обкладинка статті
- `contact-form`: відправка форми, валідація email, прикріплення файлу, ліміт розміру файлу, CAPTCHA, пробіли в обов'язкових полях
- `multilang`: перемикання мови, збереження між сторінками, відображення трьох мов, коректність символів, збереження після перезавантаження
- `coupons` (note: maps to existing TC-CPN prefix via PROMO_TC_PREFIX): застосування валідного купону, прострочений купон, мінімальна сума замовлення, два купони одночасно, пробіли в коді купону

### Task 2 — JSON Feature Filtering

- **D-10**: Add optional `"Feature"?: string` to the `TestCase` type in `src/lib/types.ts`.
- **D-11**: Add `"Feature"` field to every entry in all 10 JSON files under `data/test-cases/`. The feature string must exactly match one of the values in `MODULE_FEATURES` for that module.
- **D-12**: Filtering logic in `filterCasesForModule()` (currently in `ResultsView.tsx`): if `moduleFeatures[moduleId]` is non-empty, filter entries to those whose `tc.Feature` matches one of the selected features OR entries where `tc.Feature` is undefined/null (always-include fallback). If `moduleFeatures[moduleId]` is empty or undefined → include all entries (same as current).
- **D-13**: `filterCasesForModule()` must accept `moduleFeatures: Record<string, string[]>` as a parameter (from WizardState).
- **D-14**: No breaking change to existing test cases that lack `"Feature"` — they always pass through.

### Task 3 — Output Table Update

- **D-15**: Table columns change from `[ID, Назва, Передумови, Кроки, Очікуваний результат, Type, Layer, Пріоритет]` to exactly 7 columns: `[Title, Steps, Expected Result, Preconditions, Priority, Status, Last Verified]`. ID column is removed from the visible table.
- **D-16**: Column mapping: Title → `Назва`; Steps → `Кроки` joined as `1. … 2. …`; Expected Result → `Очікуваний результат`; Preconditions → `Передумови`; Priority → `Пріоритет` with label expansion (P0 → "P0 Critical", P1 → "P1 Important", P2 → "P2 Nice to have"); Status → hardcoded "Not started"; Last Verified → hardcoded "—".
- **D-17**: Priority badge colors: P0 Critical = red, P1 Important = yellow, P2 Nice to have = grey. Reuse/update `PriorityBadge` component at `src/components/wizard/PriorityBadge.tsx` to show expanded label.
- **D-18**: Results grouped by **Suite** field. Each Suite gets a collapsible header showing case count: `{SuiteName}  {N}`. Expand/collapse toggle per Suite. Default state: expanded.
- **D-19**: Row hover: action icon row appears on hover (🗑 📋 ↗ — delete, duplicate, open). Icons are visual-only in v1 (no backend), but must render without errors.
- **D-20**: `buildMarkdown()` updated: groups by Suite as `## SuiteName` headers; 7 columns (Title, Steps, Expected Result, Preconditions, Priority, Status, Last Verified); no `|` inside cell content (escape or remove `|`).
- **D-21**: `buildCsv()` updated to match the new 7-column schema. Status and Last Verified columns included.

### Claude's Discretion

- Exact Tailwind classes for collapsible Suite header (chevron icon, hover state)
- Whether to use React `useState` per Suite or a single `Set<string>` of collapsed suites
- Component decomposition within ResultsView (inline vs. extracted SuiteSection component)
- Exact icon library imports for row hover actions (lucide-react is already a dependency)
- Whether WizardState.moduleFeatures is initialized to `{}` or lazily populated
- Step number calculation implementation detail (derived directly from `state.modules.length`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 Spec
- `.planning/phases/04-ai-wizard-substeps/04-TASK-SPEC.md` — Full task specification with feature lists, column mapping, validation checklist

### Requirements
- `.planning/REQUIREMENTS.md` — WIZ-10, WIZ-11, WIZ-12, GEN-05, GEN-06, OUT-06, OUT-07, OUT-08

### Existing Source of Truth (files to read before modifying)
- `src/lib/types.ts` — WizardState, TestCase types (must be extended, not replaced)
- `src/constants/wizard-config.ts` — MODULE_TC_PREFIXES, MODULE_DISPLAY_NAMES, PROMO_TC_PREFIX, getTotalSteps(), hasDetailStep() (getTotalSteps must be updated)
- `src/components/wizard/Wizard.tsx` — Step routing logic (currentStep, totalSteps, handleNext, handleBack)
- `src/components/wizard/ResultsView.tsx` — filterCasesForModule(), buildMarkdown(), buildCsv(), table render
- `src/components/wizard/PriorityBadge.tsx` — Priority badge (update to show expanded label)
- `data/test-cases/*.json` — 10 files to annotate with Feature field

### Project Constraints
- `CLAUDE.md` — UI Ukrainian only; no AI; client-side only; Tailwind v4 + shadcn/ui

</canonical_refs>

<specifics>
## Specific Ideas

- The `infosite` project type also has modules (blog, search, contact-form, multilang, auth) — all must have MODULE_FEATURES entries too.
- `coupons` module doesn't appear in ECOMMERCE_MODULES or INFOSITE_MODULES directly — it's currently handled via `PROMO_TC_PREFIX` as a conditional add-on to checkout. Decide during planning whether to add a dedicated sub-step for "Купони" or fold it into the checkout sub-step.
- The Step counter change requires `getTotalSteps()` to change from `hasDetailStep(state) ? 4 : 3` to `3 + state.modules.length` (or `3 + state.modules.length + (hasDetailStep(state) ? 1 : 0)` if StepDetails survives as a separate step).
- Old StepDetails (step 4 in current code) handled checkout/auth/search/contact-form/multilang detail questions. Phase 4 replaces this with per-module feature checklists — StepDetails may be removable or must be reorganized into the new sub-step flow.
- `WizardNav` displays "Крок N з M" and Готово — it needs totalSteps updated accordingly.

</specifics>

<deferred>
## Deferred Ideas

- Row action icons (🗑 📋 ↗) are visual-only in v1 — no delete/duplicate/open functionality implemented yet (v2+)
- Mobile layout (< 768px) — out of scope for v1
- Saving/restoring moduleFeatures to localStorage — out of scope (ephemeral state per session)

</deferred>

---

*Phase: 04-ai-wizard-substeps*
*Context gathered: 2026-06-08 via PRD Express Path*
