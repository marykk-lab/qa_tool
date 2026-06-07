# Phase 3: Generation & Output — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 3-Generation & Output
**Areas discussed:** Групування в таблиці, Де відображаються результати, Фільтрація за деталями, Формат Кроки

---

## Групування в таблиці

| Option | Description | Selected |
|--------|-------------|----------|
| Групи за модулями | Кожен модуль — окремий блок з підзаголовком | ✓ |
| Flat list | Всі кейси спільно, відсортовані за ID | |
| Accordion за модулями | Кожен модуль згортається/розгортається (shadcn Collapsible) | |

**User's choice:** Групи за модулями

---

| Option | Description | Selected |
|--------|-------------|----------|
| Назва + кількість | "Кошик (4)" | ✓ |
| Тільки назва | "Кошик" (без лічильника) | |

**User's choice:** Назва + кількість у підзаголовку групи

---

| Option | Description | Selected |
|--------|-------------|----------|
| Порядок вибору | Модулі у тому ж порядку, що user обирав | ✓ |
| Алфавіт за ID-префіксом | TC-AUTH, TC-BLOG, TC-CART... | |

**User's choice:** Порядок вибору

---

| Option | Description | Selected |
|--------|-------------|----------|
| ## заголовок + таблиця | Кожен модуль = `## Назва (N)` + власна таблиця в .md | ✓ |
| Спільна таблиця | Всі кейси в одній таблиці, відсортовані за ID | |

**User's choice:** `## заголовок + таблиця` — структура .md файлу відображає UI

---

## Де відображаються результати

| Option | Description | Selected |
|--------|-------------|----------|
| Wizard розкривається на місці | Step 5 = таблиця результатів; WizardState вже в пам'яті | ✓ |
| Окрема сторінка /results | router.push('/results') зі станом у URL або context | |

**User's choice:** Wizard розкривається на місці
**Notes:** WizardState вже є в useState Wizard.tsx; не потрібно нікуди передавати.

---

## Фільтрація за деталями

| Option | Description | Selected |
|--------|-------------|----------|
| Фільтрують конкретні кейси | hasPromoCode: false → виключає кейси з тегом promo-code | ✓ |
| Всі кейси модуля завжди включаються | Деталі тільки підтверджують вибір модуля | |

**User's choice:** Фільтрують конкретні кейси
**Notes:** Потребує механізму тегування в JSON-файлах або окремої логіки фільтрації. Досліднику перевірити поточну структуру JSON і оцінити обсяг роботи.

---

## Формат Кроки

| Option | Description | Selected |
|--------|-------------|----------|
| 1. Крок 1 2. Крок 2 (з <br>) | Нумерований список в одній комірці через `<br>` | ✓ |
| Крок 1 → Крок 2 (через →) | Один рядок, без переносу | |

**User's choice:** Нумерований список з `<br>` у Markdown таблиці

---

| Option | Description | Selected |
|--------|-------------|----------|
| \n (новий рядок) | Notion підтримує перенос рядку в Rich Text; поле в лапках | ✓ |
| \| (пайп) | Простий сепаратор в одному рядку | |

**User's choice:** `\n` (newline) для CSV (Notion export)

---

## Claude's Discretion

- Місце для таблиці module ID → TC-prefix (wizard-config.ts розширення або окремий map-файл)
- Стратегія завантаження даних для client component (Server Action vs. pre-load у page.tsx як props)

## Deferred Ideas

- **Advanced TC template system** — 5 типів шаблонів (Basic, Lifecycle, Form+validation, Responsive, Integration) зі скелетами. Значно виходить за межі Phase 3.
- **AI/Notion workflow extension** — 4-кроковий AI-асистований workflow з класифікацією пріоритетів (P0/P1/P2), тегами шарів тестування, privacy-маскуванням. AI — явно out of scope для v1.
- **Pre-built TC пакети за типом проєкту** — Landing, E-commerce, AI Agent, SaaS Dashboard. Можлива v2 extension після валідації базової генерації.
