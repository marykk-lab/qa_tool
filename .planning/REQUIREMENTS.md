# Requirements: QA Test Constructor

**Defined:** 2026-06-04
**Core Value:** QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.

## v1 Requirements

### Wizard

- [ ] **WIZ-01**: Користувач може обрати тип проекту на першому кроці (E-commerce або Інформаційний сайт)
- [ ] **WIZ-02**: E-commerce: користувач обирає платформу (WooCommerce / Shopify / Інша)
- [ ] **WIZ-03**: E-commerce: користувач обирає модулі зі списку (множинний вибір, 10 варіантів: Каталог товарів, Сторінка товару, Кошик, Checkout, Особистий кабінет, Блог, Пошук, Фільтрація, Порівняння, Wishlist)
- [ ] **WIZ-04**: E-commerce: для обраних Checkout / Особистий кабінет / Пошук показуються деталізуючі питання
- [ ] **WIZ-05**: Інформаційний сайт: користувач обирає платформу (WordPress / Інша)
- [ ] **WIZ-06**: Інформаційний сайт: користувач обирає модулі зі списку (множинний вибір, 7 варіантів: Блог, Пошук, Контактна форма, Підписка, Галерея, Багатомовність, Особистий кабінет)
- [ ] **WIZ-07**: Інформаційний сайт: для обраних Контактна форма / Багатомовність показуються деталізуючі питання
- [ ] **WIZ-08**: На кожному кроці є кнопки "Назад" і "Далі"; "Назад" повертає до попереднього кроку зі збереженим станом
- [ ] **WIZ-09**: Відображається прогрес-індикатор ("Крок N з M") на кожному кроці

### Generation

- [ ] **GEN-01**: Бібліотека тест кейсів зберігається у JSON-файлах у папці `/data/test-cases/`
- [ ] **GEN-02**: Система детерміновано обирає набори кейсів з бібліотеки на основі обраних модулів і деталей
- [ ] **GEN-03**: Кожен тест кейс має поля: ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет (High / Medium / Low)
- [ ] **GEN-04**: ID-префікси відповідають модулям: TC-CAT, TC-PDP, TC-CART, TC-CHK, TC-AUTH, TC-SRCH, TC-BLOG, TC-FORM, TC-LANG, TC-CPN

### Output

- [ ] **OUT-01**: Після проходження wizard відображається таблиця всіх згенерованих кейсів
- [ ] **OUT-02**: Кнопка "Copy Markdown" копіює таблицю у форматі Markdown в буфер обміну
- [ ] **OUT-03**: Кнопка "Download .md" завантажує файл `test-cases_{type}_{date}.md`
- [ ] **OUT-04**: Кнопка "Почати заново" скидає wizard і повертає до кроку 1
- [ ] **OUT-05**: Кнопка "Export to Notion (.csv)" завантажує UTF-8 CSV з колонками ID, Name, Preconditions, Steps, Expected, Priority, Module — придатний для імпорту в Notion як database

### UI / NFR

- [ ] **UI-01**: UI виконано у стилі Feedboon — темна тема: фон `#0a0a0a`, картки `#171717`, акцент `#3ecf8e` (зелений), світлий текст. Кнопки, шрифти, відступи відповідають Feedboon-дизайну (референс: `image.png`). Реалізація через Tailwind v4 `@theme {}` + shadcn/ui компоненти.
- [ ] **UI-02**: Desktop-first верстка; коректне відображення на tablet (≥768px)
- [ ] **UI-03**: Використовуються shadcn/ui компоненти: Button, Card, Badge, Checkbox, RadioGroup, Progress, Sonner (toast-сповіщення)

## v2 Requirements

### Extensions

- **EXT-01**: Інші типи проектів (SaaS, мобільний додаток, тощо)
- **EXT-02**: Ручне редагування згенерованих кейсів перед вивантаженням
- **EXT-03**: Збереження сесії / history генерацій
- **EXT-04**: Інші мови інтерфейсу

### Integration

- **INT-01**: Інтеграція як вкладки в платформу Feedboon
- **INT-02**: Авторизація через Feedboon-аккаунт

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI-генерація кейсів | Явна вимога: тільки детермінована логіка |
| Бекенд / база даних | Зайва складність для v1 — все на клієнті |
| Мобільна версія (< 768px) | Desktop+tablet для v1; мобіль у v2 |
| Авторизація / сесії | Не потрібна для standalone-режиму |
| Редагування кейсів після генерації | v2+ |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WIZ-01 | Phase 2 | Pending |
| WIZ-02 | Phase 2 | Pending |
| WIZ-03 | Phase 2 | Pending |
| WIZ-04 | Phase 2 | Pending |
| WIZ-05 | Phase 2 | Pending |
| WIZ-06 | Phase 2 | Pending |
| WIZ-07 | Phase 2 | Pending |
| WIZ-08 | Phase 2 | Pending |
| WIZ-09 | Phase 2 | Pending |
| GEN-01 | Phase 2 | Pending |
| GEN-02 | Phase 3 | Pending |
| GEN-03 | Phase 2 | Pending |
| GEN-04 | Phase 2 | Pending |
| OUT-01 | Phase 3 | Pending |
| OUT-02 | Phase 3 | Pending |
| OUT-03 | Phase 3 | Pending |
| OUT-04 | Phase 3 | Pending |
| OUT-05 | Phase 3 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-04*
*Last updated: 2026-06-04 after roadmap creation*
