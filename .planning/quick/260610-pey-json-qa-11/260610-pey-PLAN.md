---
phase: quick
plan: 260610-pey
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/types.ts
  - src/components/wizard/ResultsView.tsx
  - data/test-cases/auth.json
  - data/test-cases/blog.json
  - data/test-cases/cart.json
  - data/test-cases/catalog.json
  - data/test-cases/checkout.json
  - data/test-cases/contact-form.json
  - data/test-cases/coupons.json
  - data/test-cases/multilang.json
  - data/test-cases/product.json
  - data/test-cases/search.json
autonomous: false
requirements: [GEN-04]
must_haves:
  truths:
    - "Скопійований/завантажений Markdown — рівно одна таблиця з 11 колонками у заданому порядку, без тексту до або після неї"
    - "Кроки нумеруються рівно один раз (1. 2. 3.) в UI, Markdown, CSV та копіюванні рядка — без подвійних префіксів «1. 1.»"
    - "Кожен TestCase має поле «Тестові дані» з конкретним значенням або «—»"
    - "У жодному JSON-кейсі немає Layer зі значенням «Feature» — лише Smoke або Regression"
    - "UI-таблиця результатів показує колонки Test Data, Test Layer, Test Type на додачу до наявних"
  artifacts:
    - path: "src/lib/types.ts"
      provides: "TestCase з полем «Тестові дані» та Layer звуженим до Smoke|Regression"
      contains: "Тестові дані"
    - path: "src/components/wizard/ResultsView.tsx"
      provides: "buildMarkdown/buildCsv/handleCopyRow на 11 колонок + оновлена UI-таблиця"
      contains: "Test Data"
    - path: "data/test-cases/auth.json"
      provides: "Кейси без числових префіксів у кроках, з полем «Тестові дані», Layer Regression"
      contains: "Тестові дані"
  key_links:
    - from: "data/test-cases/*.json Кроки"
      to: "ResultsView render/export numbering"
      via: "чисті дії в JSON + нумерація `${i+1}.` лише на рівні відображення"
      pattern: "Кроки"
---

<objective>
Привести формат тест-кейсів (JSON-схема + дані) та весь експорт/відображення до нової специфікації QA-таблиці з 11 колонок:

`| Suite | Test Case | Priority | Status | Preconditions | Steps | Expected Result | Test Data | Test Layer | Test Type | Last Verified |`

Purpose: QA-команда отримує єдину таблицю в точному форматі для імпорту (Notion/Markdown) без ручного редагування і без артефактів подвійної нумерації.
Output: оновлені `types.ts`, `ResultsView.tsx` та всі 10 JSON-файлів у `data/test-cases/`.

Логіка wizard (кроки, уточнюючі питання, фільтрація `filterCasesForModule`, тег `Feature?`) НЕ змінюється — лише схема, дані та представлення/експорт.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@src/lib/types.ts
@src/components/wizard/ResultsView.tsx
@src/components/wizard/PriorityBadge.tsx
@src/components/TestCaseCard.tsx
@data/test-cases/auth.json

<interfaces>
<!-- Контракти, які виконавець використовує напряму. Кодову базу досліджувати не треба. -->

Поточний TestCase (src/lib/types.ts):
```typescript
export type TestCase = {
  ID: string;
  Назва: string;
  Suite: string;
  Передумови: string;
  Кроки: string[];
  "Очікуваний результат": string;
  Type: "E2E" | "Manual" | "Unit" | "Component" | "Integration";
  Layer: "Smoke" | "Regression" | "Feature";   // ← звузити до "Smoke" | "Regression"
  Пріоритет: "P0" | "P1" | "P2";
  Feature?: string;                              // ← це ТЕГ фільтрації, НЕ чіпати
};
```

ВАЖЛИВО — два різні поняття «Feature»:
1. `Feature?: string` (опційний ТЕГ модуля, рядки 54-58) — використовується у `filterCasesForModule` для фільтрації по фічах. ЗАЛИШИТИ без змін.
2. `Layer: ... | "Feature"` — значення CI-шару. ВИДАЛИТИ зі схеми; у JSON замінити `"Layer": "Feature"` → `"Layer": "Regression"`.

PRIORITY_LABELS (вже існує в ResultsView.tsx та PriorityBadge.tsx):
```typescript
{ P0: "P0 Critical", P1: "P1 Important", P2: "P2 Nice to have" }
```

sanitize() (вже існує — зберегти): `val.replace(/\|/g, "/")` — прибирає `|` з клітинок.

Точна цільова шапка Markdown (11 колонок, цей порядок):
| Suite | Test Case | Priority | Status | Preconditions | Steps | Expected Result | Test Data | Test Layer | Test Type | Last Verified |

Правила контенту клітинок:
- Suite        → tc.Suite
- Test Case    → tc.Назва (без префіксів/ID)
- Priority     → PRIORITY_LABELS[tc.Пріоритет]
- Status       → завжди "Not started"
- Preconditions→ tc.Передумови (або «—»)
- Steps        → нумерований `1. … 2. … 3. …` в одній клітинці (нумерація додається ТУТ)
- Expected     → tc["Очікуваний результат"]
- Test Data    → tc["Тестові дані"]
- Test Layer   → tc.Layer
- Test Type    → tc.Type
- Last Verified→ порожня клітинка (НЕ «—»)
</interfaces>

Поточний стан робочого дерева містить незакомічені зміни користувача (ResultsView.tsx, StepModules.tsx, WizardNav.tsx, REQUIREMENTS.md). Працювати з ПОТОЧНИМ станом файлів з диска — НЕ відкочувати ці зміни.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Оновити схему TestCase та переписати рендер/експорт під 11 колонок</name>
  <files>src/lib/types.ts, src/components/wizard/ResultsView.tsx</files>
  <action>
В `src/lib/types.ts`:
- Додати поле `"Тестові дані": string;` (укр. ключ як інші поля; розмістити після «Очікуваний результат» з JSDoc-коментарем: конкретні реалістичні значення або «—»).
- Звузити `Layer` до `"Smoke" | "Regression"` (прибрати `"Feature"`). Оновити JSDoc Layer — прибрати рядок про Feature.
- НЕ чіпати опційний тег `Feature?: string` (це поле фільтрації, рядки 54-58).

В `src/components/wizard/ResultsView.tsx`:
- `buildMarkdown`: прибрати заголовок `# Результати…` та цикл по `## ${suiteName}` з окремими таблицями. Замість цього згенерувати РІВНО ОДНУ таблицю. Перший рядок виводу — шапка (без жодного тексту до неї), потім роздільник, потім по одному рядку на КОЖЕН кейс з усіх suites. Колонки рівно у порядку специфікації (див. <interfaces>). Suite стає першою клітинкою кожного рядка (tc.Suite). Прибрати невикористаний параметр `state`/локальні `projectTypeLabel`/`todayISO`, якщо вони більше не потрібні. Після останнього рядка — жодного тексту.
- Нумерація кроків у Markdown: лишити `tc.Кроки.map((s, i) => \`${i + 1}. ${s}\`).join(" ")` — цей `${i+1}.` ТЕПЕР єдине джерело нумерації (Task 2 прибирає префікси з JSON). Last Verified — порожня клітинка `""`.
- `buildCsv`: ту саму шапку 11 колонок у тому ж порядку (через escapeCell), BOM зберегти. Steps нумерувати `${i+1}.` через `join("\n")`. Last Verified — порожня клітинка `""`.
- `handleCopyRow`: той самий 11-колонковий рядок у тому ж порядку, нумерація `${i+1}.`, Last Verified порожня.
- UI-таблиця (thead/tbody): оновити колонки. Групування по suite у UI ЛИШИТИ (suiteName як заголовок групи), але додати в кожен рядок колонки Test Data (`tc["Тестові дані"]`), Test Layer (`tc.Layer`), Test Type (`tc.Type`). Існуючі колонки Title→лишити підпис «Test Case» опційно; Status «Not started»; Last Verified — порожня клітинка замість «—». Список кроків у tbody вже рендерить `{step}` без власної нумерації — додати нумерацію `{i + 1}. {step}` (бо JSON після Task 2 буде без префіксів). Назви колонок — англійською згідно специфікації.
- Зберегти `sanitize()` у всіх Markdown-клітинках.
  </action>
  <verify>
    <automated>cd C:\folder1\qa_app; npx tsc --noEmit 2>&1 | Select-String -Pattern "types.ts|ResultsView" -SimpleMatch; if ($LASTEXITCODE -eq 0) { echo "TSC OK" }</automated>
  </verify>
  <done>types.ts має поле «Тестові дані» і Layer = Smoke|Regression; ResultsView.tsx будує одну 11-колонкову таблицю в Markdown/CSV/copy і показує Test Data/Test Layer/Test Type в UI; tsc без помилок у цих двох файлах.</done>
</task>

<task type="auto">
  <name>Task 2: Мігрувати всі 10 JSON-файлів під нову схему</name>
  <files>data/test-cases/auth.json, data/test-cases/blog.json, data/test-cases/cart.json, data/test-cases/catalog.json, data/test-cases/checkout.json, data/test-cases/contact-form.json, data/test-cases/coupons.json, data/test-cases/multilang.json, data/test-cases/product.json, data/test-cases/search.json</files>
  <action>
Для КОЖНОГО з 10 файлів і КОЖНОГО кейса (62 кейси загалом):

1. Кроки — прибрати числові префікси на початку кожного рядка масиву `Кроки` (видалити шаблон `^\d+\.\s*`). Зберігати ЧИСТУ дію. Приклад: `"1. Відкрити сторінку реєстрації"` → `"Відкрити сторінку реєстрації"`. Нумерацію тепер додає рендер/експорт (Task 1) — інакше буде подвійна нумерація. Перевірити: перший крок кожного кейса починається з точки входу (URL/назва екрана/сторінки) — якщо ні, переформулювати перший крок як вхід у точку (напр. «Відкрити сторінку …», «Перейти на …»).

2. Layer — замінити `"Layer": "Feature"` → `"Layer": "Regression"` скрізь (15 входжень у 10 файлах). Допустимі значення лишаються Smoke або Regression. Smoke лишати лише на критичних happy-path кейсах, де він вже стоїть.

3. Додати в КОЖЕН кейс нове поле `"Тестові дані"` з КОНКРЕТНИМИ реалістичними значеннями українською: email-адреси (напр. `qa.user@example.com`), суми в грн (напр. `1 250 грн`), дати (напр. `15.07.2026`), тексти повідомлень, кількості, промокоди тощо — релевантні до конкретного кейса. Де дані для кроку не потрібні (напр. чистий вихід/навігація) — поставити рядок «—». Замінити будь-які плейсхолдери у тексті типу `{registered_email}`, `{valid_password}`, `{min_password_length}` на конкретні значення в полі «Тестові дані» (і в тексті кроків/передумов лишити природне формулювання). Розмістити поле після «Очікуваний результат», щоб відповідати порядку схеми.

4. Sanitize-контроль: переконатися, що в жодній клітинці немає символу `|` (вертикальна риска). Якщо є — замінити на `/`.

5. Мова контенту — українська. JSON має лишатися валідним (правильні коми, лапки, екранування).

НЕ змінювати: ID, Suite, тег Feature (фільтрація), Пріоритет, Type (окрім випадків де очевидно треба — не чіпати без потреби), логіку фільтрації.
  </action>
  <verify>
    <automated>cd C:\folder1\qa_app; node -e "const fs=require('fs');const d='data/test-cases';let bad=0,nofeat=0,nodata=0,prefix=0;for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.json'))){const a=JSON.parse(fs.readFileSync(d+'/'+f,'utf8'));for(const tc of a){if(tc.Layer==='Feature')nofeat++;if(!('Тестові дані' in tc))nodata++;if(tc.Кроки.some(s=>/^\d+\.\s/.test(s)))prefix++;if((tc.Кроки.join('')+tc['Очікуваний результат']+tc.Передумови).includes('|'))bad++;}}console.log('Layer=Feature:',nofeat,'| missing ТестовіДані:',nodata,'| step prefixes:',prefix,'| pipe chars:',bad);if(nofeat||nodata||prefix||bad)process.exit(1);console.log('ALL JSON OK')"</automated>
  </verify>
  <done>Усі 62 кейси: без числових префіксів у Кроки, мають поле «Тестові дані», без Layer «Feature», без символу `|`; усі 10 файлів — валідний JSON; перевірочний скрипт друкує ALL JSON OK.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Оновлена схема + дані + експорт: TestCase отримав поле «Тестові дані» і Layer Smoke|Regression; усі 10 JSON-файлів мігровано (чисті кроки, конкретні тестові дані, Layer без Feature); ResultsView генерує єдину 11-колонкову Markdown-таблицю, CSV і копіювання рядка в тому ж форматі, а UI-таблиця показує Test Data / Test Layer / Test Type. Нумерація кроків — рівно один раз.
  </what-built>
  <how-to-verify>
1. Запустити: `cd C:\folder1\qa_app; npm run dev`
2. Відкрити http://localhost:3000, пройти wizard до екрана результатів (обрати кілька модулів).
3. Перевірити UI-таблицю: кроки нумеруються один раз (1. 2. 3., без «1. 1.»); видно колонки Test Data, Test Layer, Test Type; Last Verified — порожня клітинка.
4. Натиснути «Скопіювати Markdown», вставити в текстовий редактор: має бути РІВНО ОДНА таблиця з шапкою `| Suite | Test Case | Priority | Status | Preconditions | Steps | Expected Result | Test Data | Test Layer | Test Type | Last Verified |`, без тексту до/після, Suite у першій колонці кожного рядка.
5. Натиснути «Завантажити .md» та «Експорт до Notion (.csv)» — перевірити ті самі 11 колонок у тому ж порядку; CSV відкривається в Notion/Excel з кирилицею (BOM).
6. Перевірити: тестові дані конкретні (email/суми/дати), а не плейсхолдери `{…}`.
  </how-to-verify>
  <resume-signal>Напишіть «approved» або опишіть проблеми</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` — без помилок типів.
- JSON-скрипт (Task 2 verify) друкує ALL JSON OK.
- Markdown-експорт містить рівно один рядок-шапку з 11 колонками у заданому порядку і жодного тексту поза таблицею (людська перевірка).
- Нумерація кроків з'являється рівно один раз скрізь (UI/MD/CSV/copy).
</verification>

<success_criteria>
- TestCase має «Тестові дані»; Layer = Smoke|Regression; тег Feature? недоторканий; логіка wizard не змінена.
- Усі 10 JSON-файлів валідні, без префіксів кроків, без Layer «Feature», з конкретними тестовими даними, без `|`.
- buildMarkdown/buildCsv/handleCopyRow та UI-таблиця — формат з 11 колонок у точному порядку специфікації.
- Подвійна нумерація усунена.
- Людська перевірка пройдена (approved).
</success_criteria>

<output>
Create `.planning/quick/260610-pey-json-qa-11/260610-pey-SUMMARY.md` when done
</output>
