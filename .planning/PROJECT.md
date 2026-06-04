# QA Test Constructor

## What This Is

Standalone веб-додаток для QA-команди: покроковий wizard, який через серію фіксованих питань збирає параметри проекту та генерує готовий набір тест кейсів. Логіка детермінована — жодного AI, лише матриця "відповідь → кейси". Першочергово розгортається локально та на Vercel, в майбутньому стане окремою вкладкою у платформі Feedboon.

## Core Value

QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Wizard з кроками (тип проекту → платформа → модулі → деталі)
- [ ] Два дерева питань: E-commerce і Інформаційний сайт
- [ ] Детермінована генерація тест кейсів з JSON-бібліотеки
- [ ] Таблиця-превью згенерованих кейсів (ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет)
- [ ] Кнопка "Copy Markdown" — копіює таблицю в буфер
- [ ] Кнопка "Download .md" — завантажує файл з назвою test-cases_{type}_{date}.md
- [ ] Кнопка "Почати заново" на фінальному екрані
- [ ] Кнопки "Назад" / "Далі" на кожному кроці
- [ ] Прогрес-бар / індикатор кроків ("Крок 2 з 4")
- [ ] UI у стилі Feedboon (кольори, шрифти, відступи) — референс буде надано
- [ ] Desktop-first; коректне відображення на tablet

### Out of Scope

- AI-генерація кейсів — проект явно детермінований
- Бекенд / база даних — все у клієнті та JSON-файлах
- Мобільна версія (< 768px) — v1 desktop+tablet only
- Авторизація / сесії — не потрібна для standalone-режиму
- Редагування кейсів вручну після генерації — v2+
- Інші мови крім української — v1 тільки UA

## Context

- Проект є частиною екосистеми Feedboon (bug-tracking платформа у стилі Jira для команд QA)
- Той самий стек: Next.js + Tailwind CSS
- Стиль Feedboon буде описано через скріншоти/посилання, які надасть замовник
- Бібліотека тест кейсів зберігається у JSON-файлах (`/data/test-cases/*.json`) — редагування без перекомпіляції
- Розгортання: локально → Vercel (standalone) → майбутня інтеграція як вкладки Feedboon

## Constraints

- **Tech Stack**: Next.js + Tailwind CSS — відповідає стеку Feedboon
- **Storage**: тільки статика, JSON-файли у проекті — бекенд поза скоупом
- **Language**: UI тільки українською
- **Design**: стиль Feedboon (референс очікується від замовника перед UI-фазою)
- **Deployment**: Vercel-compatible (static export або Next.js deploy)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind | Відповідає стеку Feedboon для майбутньої інтеграції | — Pending |
| JSON-файли для бібліотеки кейсів | Редагування контенту без перекомпіляції, прозора структура | — Pending |
| Детермінована логіка без AI | Передбачуваний, аудитований вивід — критично для QA-контексту | — Pending |
| Standalone → Vercel → Feedboon | Швидкий старт з чистою точкою інтеграції пізніше | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-04 after initialization*
