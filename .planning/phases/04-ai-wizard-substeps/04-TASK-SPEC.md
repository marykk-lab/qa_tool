# Phase 4 Task Spec: Dynamic Wizard Sub-steps + Feature-based Filtering

**Source:** `claude-code-prompt-wizard-update (2).md` (received 2026-06-08)
**Phase:** 4 — Wizard Sub-steps & Feature Filtering

**Stack reminder:** No AI, no backend. Deterministic selection from `/data/test-cases/*.json`. All client-side.

---

## Current State

Wizard has 3 steps:
1. Project type (E-commerce / Інформаційний сайт)
2. Platform/tech details
3. Module selection (checkboxes)

On finish → matches selected modules → loads all entries from matching JSON files → renders table.

---

## Task 1 — Dynamic Sub-steps After Module Selection

After step 3 (module selection), dynamically insert a sub-step per selected module titled:
**"{Module name} — що є в модулі?"**

Each sub-step shows feature checkboxes (multi-select). User checks only what exists in their project.
Unselected modules → sub-step skipped entirely.

Step counter is dynamic:
```
Total steps = 3 (base) + number of selected modules
```
Example: user selects Блог + Кошик → "Крок 4 з 5", "Крок 5 з 5".

Going back to step 3 and unchecking a module → removes its sub-step, counter updates immediately.

### Feature Checklists Per Module

**Каталог товарів:**
список товарів із пагінацією, фільтрація за категорією, сортування (ціна/назва/новизна), пошук у каталозі, картка товару в списку (фото/ціна/назва), значок «Немає в наявності», швидкий перегляд товару, порівняння товарів, нескінченний скрол / кнопка «Завантажити ще», теги та мітки (новинка/акція/хіт)

**Сторінка товару (PDP):**
назва/ціна/опис/фото, галерея зображень, вибір варіанту (розмір/колір), кількість товару, кнопка «Додати до кошика», кнопка «Купити зараз», блок «Схожі товари», відгуки та рейтинг, вкладки (опис/характеристики/відгуки), відеоогляд товару, наявність на складі, SEO-метадані

**Кошик:**
перегляд вмісту кошика, зміна кількості, видалення товару, збереження кошика після перезавантаження, міні-кошик у шапці, порожній кошик (стан), перехід до оформлення

**Checkout:**
форма доставки, форма оплати, вибір способу доставки, вибір способу оплати, застосування промокоду, підсумок замовлення, гостьове оформлення, підтвердження замовлення (email), відмова платежу

**Авторизація:**
реєстрація, вхід, вихід, відновлення пароля, валідація полів, вхід через соцмережі, особистий кабінет, історія замовлень, редагування профілю

**Пошук:**
пошук за точною назвою, результат «нічого не знайдено», автодоповнення, пошук з фільтрами, пошук одним символом, пошук з максимальною довжиною запиту

**Блог:**
список статей із пагінацією, сторінка окремої статті, категорії/рубрики, теги, пошук по блогу, фільтрація/сортування статей, коментарі, поділитися в соцмережах, схожі/рекомендовані статті, RSS-стрічка, автор статті, дата публікації, прев'ю/обкладинка статті

**Контактна форма:**
відправка форми, валідація email, прикріплення файлу, ліміт розміру файлу, CAPTCHA, пробіли в обов'язкових полях

**Багатомовність:**
перемикання мови, збереження між сторінками, відображення трьох мов, коректність символів, збереження після перезавантаження

**Купони:**
застосування валідного купону, прострочений купон, мінімальна сума замовлення, два купони одночасно, пробіли в коді купону

---

## Task 2 — Update JSON Filtering Logic

### Current behavior
Selected module "Блог" → load all entries from `blog.json` → add to output.

### New behavior
Selected module "Блог" + checked features ["список статей із пагінацією", "теги", "коментарі"]
→ load entries from `blog.json`
→ keep only entries whose `"Feature"` field matches one of the checked features
→ add matching entries to output

### New JSON field: `"Feature"`

Each test case entry gets a new optional `"Feature"` string field:

```json
{
  "ID": "TC-BLOG-001",
  "Назва": "Відкрити список статей блогу",
  "Suite": "Блог",
  "Feature": "список статей із пагінацією",
  "Передумови": "...",
  "Кроки": ["..."],
  "Очікуваний результат": "...",
  "Type": "E2E",
  "Layer": "Smoke",
  "Пріоритет": "P1"
}
```

### Fallback rules
- Entry has no `"Feature"` field → always include (backwards compatible)
- Module selected but zero features checked in sub-step → include all entries from that module's JSON (same as current)

---

## Task 3 — Update Output Table Columns

### Old columns
`ID | Назва | Передумови | Кроки | Очікуваний результат | Пріоритет`

### New columns (Feedboon format)
`Title | Steps | Expected Result | Preconditions | Priority | Status | Last Verified`

### Column mapping
| Column | Source |
|--------|--------|
| Title | `Назва` field |
| Steps | `Кроки` array — join as `1. … 2. … 3. …` in one cell |
| Expected Result | `Очікуваний результат` field |
| Preconditions | `Передумови` field |
| Priority | `Пріоритет` field — map: `P0` → `P0 Critical`, `P1` → `P1 Important`, `P2` → `P2 Nice to have` |
| Status | Always hardcode `Not started` |
| Last Verified | Always `—` |

### UI rendering
- Grouped by **Suite** — each Suite is a collapsible section header (e.g. "Контактна форма  31") showing case count
- Inside Suite group: 7 columns, no Suite column in rows
- Priority: colored badge — P0 Critical (red) / P1 Important (yellow) / P2 Nice to have (grey)
- Status: plain text `Not started`
- Last Verified: `—` when empty
- Row hover: action icons — delete, duplicate, open (🗑 📋 ↗)

### Markdown / Download format
Grouped by Suite, each Suite is a `## SuiteName` header followed by a table:

```
## Блог

| Title | Steps | Expected Result | Preconditions | Priority | Status | Last Verified |
|-------|-------|-----------------|---------------|----------|--------|---------------|
| Відкрити список статей | 1. … 2. … | Список відображається | — | P1 Important | Not started | — |
```

No `|` characters inside cell content — escape or remove from source data.

---

## Validation Checklist

- [ ] 0 modules → no sub-steps, wizard works normally
- [ ] 3 modules → 3 sub-steps, counter is dynamic
- [ ] Uncheck module after visiting sub-step → sub-step removed, counter updates
- [ ] Sub-step with no features checked → all JSON entries for that module included (fallback)
- [ ] Sub-step with features checked → only matching entries included
- [ ] Entries without `"Feature"` field → always included
- [ ] Output grouped by Suite with section headers showing case count
- [ ] Table has exactly 7 columns: Title, Steps, Expected Result, Preconditions, Priority, Status, Last Verified
- [ ] Priority badge: P0 Critical (red) / P1 Important (yellow) / P2 Nice to have (grey)
- [ ] Status always `Not started`
- [ ] Last Verified always `—`
- [ ] No `|` inside any cell in markdown output
- [ ] Markdown export groups by Suite as `## SuiteName` headers
