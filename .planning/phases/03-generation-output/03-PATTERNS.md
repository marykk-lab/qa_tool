# Phase 3: Generation & Output — Pattern Map

**Mapped:** 2026-06-07
**Files analyzed:** 8 new/modified files
**Analogs found:** 7 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/wizard/ResultsView.tsx` | component | transform (WizardState → rendered table) | `src/components/wizard/StepDetails.tsx` | role-match |
| `src/components/wizard/PriorityBadge.tsx` | component | transform (priority string → Badge) | `src/components/TestCaseCard.tsx` (priorityBadgeClass) | role-match |
| `src/components/wizard/Wizard.tsx` | component (modify) | event-driven | `src/components/wizard/Wizard.tsx` itself (lines 93–105) | exact — injection point |
| `src/app/page.tsx` | route (Server Component, modify) | file-I/O → request-response | `src/app/page.tsx` itself + `src/lib/test-cases.ts` | exact |
| `src/lib/test-cases.ts` | utility (modify) | file-I/O | `src/lib/test-cases.ts` itself | exact |
| `src/lib/types.ts` | model (possibly modify) | — | `src/lib/types.ts` itself | exact |
| `data/test-cases/*.json` | data (possibly modify) | — | `data/test-cases/checkout.json` | exact |
| `src/constants/wizard-config.ts` | config (modify) | — | `src/constants/wizard-config.ts` itself | exact |

---

## Pattern Assignments

### `src/components/wizard/ResultsView.tsx` (component, transform)

**Analog:** `src/components/wizard/StepDetails.tsx`

**Imports pattern** (StepDetails.tsx lines 1–6):
```tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WizardState } from "@/lib/types";
```

**ResultsView imports to use** (adapt from StepDetails + Wizard patterns):
```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileX } from "lucide-react";
import type { WizardState, TestCase } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
```

**Props type pattern** (adapt from StepDetails.tsx lines 7–10):
```tsx
// StepDetails uses: state: WizardState + onChange callback
// ResultsView receives read-only data — no onChange:
type Props = {
  state: WizardState;
  allCases: TestCase[];
  onRestart: () => void;
};
```

**Step content container pattern** (StepDetails.tsx lines 13–17, StepModules.tsx lines 28–29):
```tsx
// All wizard step components use this exact wrapper:
<div className="px-8 py-6">
  <h2 className="text-xl font-semibold text-foreground mb-1">...</h2>
  <p className="text-base text-muted-foreground mb-4">...</p>
```

**Toast pattern** (Wizard.tsx lines 4, 23–24):
```tsx
import { toast } from "sonner";
// ...
toast.error("Будь ласка, оберіть тип проекту");
// For copy success use:
toast.success("Markdown скопійовано в буфер обміну");
```

**Toaster mount** (layout.tsx line 34):
```tsx
// Already mounted in layout.tsx — do NOT add a second <Toaster>:
<Toaster theme="dark" position="bottom-right" />
```

**Module group iteration pattern** (StepDetails.tsx lines 23–55 — conditional blocks per module):
```tsx
// StepDetails conditionally renders a block per selected module:
{modules.includes("checkout") && (
  <div className="mb-6">
    <h3 className="text-base font-semibold text-foreground mb-3">Checkout</h3>
    ...
  </div>
)}
// ResultsView maps state.modules in selection order:
{state.modules.map((moduleId) => {
  const cases = filterCasesForModule(moduleId, state, allCases);
  if (cases.length === 0) return null;
  return (
    <div key={moduleId} className="mb-6 last:mb-0">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        {MODULE_DISPLAY_NAMES[moduleId]} ({cases.length})
      </h3>
      {/* TestCaseTable inline or extracted component */}
    </div>
  );
})}
```

**Empty state pattern** (no direct analog — follow UI-SPEC):
```tsx
// When all filtered case arrays are empty:
<div className="px-8 py-12 text-center">
  <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
  <h2 className="text-xl font-semibold text-foreground mb-2">
    Тест кейси не знайдено
  </h2>
  <p className="text-base text-muted-foreground">
    За обраними параметрами кейсів не знайдено. Поверніться назад і скоригуйте вибір модулів.
  </p>
</div>
```

**Download file trigger pattern** (no direct analog — standard browser API):
```tsx
// File download via anchor click (sync, no loading state needed):
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
// Filename pattern (from 03-CONTEXT.md specifics):
// `test-cases_${state.projectType}_${new Date().toISOString().slice(0, 10)}.md`
// `test-cases_${state.projectType}_${new Date().toISOString().slice(0, 10)}.csv`
```

**CSV UTF-8 BOM pattern** (D-12):
```tsx
// Prepend BOM for correct Excel/Notion import:
const BOM = "﻿";
const csv = BOM + "ID,Name,Preconditions,Steps,Expected,Priority,Module\n" + rows;
```

---

### `src/components/wizard/PriorityBadge.tsx` (component, transform)

**Analog:** `src/components/TestCaseCard.tsx` (priorityBadgeClass function, lines 11–19) + `src/components/ui/badge.tsx`

**Existing priority mapping in TestCaseCard.tsx** (lines 11–19) — light theme, do NOT copy colors:
```tsx
// Old pattern (light theme, Phase 1 — do not reuse colors):
function priorityBadgeClass(priority: TestCase["Пріоритет"]): string {
  switch (priority) {
    case "High":   return "bg-red-100 text-red-800 border border-red-200";
    case "Medium": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Low":    return "bg-green-100 text-green-800 border border-green-200";
  }
}
```

**Badge component signature** (badge.tsx lines 29–46):
```tsx
// Badge accepts variant + className override — use variant="outline" + cn() className:
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
```

**PriorityBadge — exact pattern from UI-SPEC** (use dark theme colors, not TestCaseCard colors):
```tsx
"use client";  // Not strictly needed for this pure-display component, but follow wizard component convention

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  High:   "bg-red-950/60 text-red-400 border-red-800",
  Medium: "bg-amber-950/60 text-amber-400 border-amber-800",
  Low:    "bg-zinc-800/60 text-zinc-400 border-zinc-700",
};

export function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-sm font-normal", PRIORITY_STYLES[priority])}
      aria-label={`${priority} пріоритет`}
    >
      {priority}
    </Badge>
  );
}
```

Note: `cn()` import from `@/lib/utils` — confirmed in utils.ts (lines 1–4: `clsx` + `twMerge`).

---

### `src/components/wizard/Wizard.tsx` (component, modify — step 5 injection)

**Analog:** `src/components/wizard/Wizard.tsx` itself

**Injection point** (Wizard.tsx lines 93–105 — replace this block):
```tsx
// CURRENT (lines 93–102) — replace entirely:
{currentStep === 5 && (
  <div className="px-8 py-6 text-center">
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Готово!
    </h2>
    <p className="text-base text-muted-foreground">
      Параметри зібрано. Натисніть кнопку нижче, щоб отримати тест кейси.
    </p>
  </div>
)}
```

**Replace with:**
```tsx
{currentStep === 5 && (
  <ResultsView
    state={state}
    allCases={props.initialCases}
    onRestart={() => {
      setState(INITIAL_WIZARD_STATE);
      setCurrentStep(1);
    }}
  />
)}
```

**Import to add** (follow existing import block at lines 1–12):
```tsx
import ResultsView from "./ResultsView";
```

**Props pattern** (Wizard.tsx line 14 — currently `export default function Wizard()`):
```tsx
// Extend signature to receive pre-loaded cases:
type WizardProps = {
  initialCases: TestCase[];
};
export default function Wizard({ initialCases }: WizardProps) {
```

**Restart logic** (uses INITIAL_WIZARD_STATE already imported at line 5):
```tsx
import { INITIAL_WIZARD_STATE, type WizardState } from "@/lib/types";
// Restart: setState(INITIAL_WIZARD_STATE); setCurrentStep(1);
```

**WizardNav isCompletion at step 5** (Wizard.tsx line 64 — already wired, but WizardNav needs update):
```tsx
<WizardNav
  currentStep={currentStep}
  totalSteps={totalSteps}
  onNext={handleNext}
  onBack={handleBack}
  state={state}
  isCompletion={currentStep === 5}   // ← already passes true at step 5
/>
```

---

### `src/app/page.tsx` (Server Component, modify)

**Analog:** `src/app/page.tsx` itself (lines 1–19) + `src/lib/test-cases.ts` `loadAllTestCases()`

**Current page.tsx** (lines 1–19 — full file):
```tsx
// No "use client" directive — page.tsx stays a Server Component.
// Wizard.tsx is "use client" and owns all state.
import Wizard from "@/components/wizard/Wizard";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Конструктор тест кейсів
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Генератор тест кейсів для QA-команди
        </p>
        <Wizard />
      </div>
    </main>
  );
}
```

**Extended pattern** (add `loadAllTestCases` call + pass `initialCases` prop):
```tsx
import Wizard from "@/components/wizard/Wizard";
import { loadAllTestCases } from "@/lib/test-cases";
import type { TestCase } from "@/lib/types";

export default async function Home() {
  const allCases: TestCase[] = loadAllTestCases();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Конструктор тест кейсів
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Генератор тест кейсів для QA-команди
        </p>
        <Wizard initialCases={allCases} />
      </div>
    </main>
  );
}
```

Note: `loadAllTestCases()` uses Node `fs` (server-only) — safe in a Server Component, confirmed in test-cases.ts line 1: `import fs from "fs"`. No `"use client"` directive on page.tsx.

---

### `src/lib/test-cases.ts` (utility, modify)

**Analog:** `src/lib/test-cases.ts` itself

**Existing `loadAllTestCases` pattern** (lines 37–56 — no changes needed to this function):
```tsx
export function loadAllTestCases(): TestCase[] {
  const dataDir = getDataDir();
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  const results: TestCase[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        results.push(...(parsed as TestCase[]));
      } else {
        results.push(parsed as TestCase);
      }
    } catch (err) {
      console.error(`[test-cases] Failed to load ${file}:`, err);
    }
  }
  return results;
}
```

**Existing `loadModuleTestCases` pattern** (lines 62–64 — already working by TC-prefix):
```tsx
export function loadModuleTestCases(prefix: string): TestCase[] {
  return loadAllTestCases().filter((tc) => tc.ID.startsWith(prefix));
}
```

**No changes required to test-cases.ts** if filtering is done in ResultsView using `allCases` prop. The module-ID→TC-prefix mapping lives in `wizard-config.ts` (see below). `loadAllTestCases()` already handles array and single-object JSON files.

---

### `src/lib/types.ts` (model, possibly modify)

**Analog:** `src/lib/types.ts` itself

**Current TestCase type** (lines 10–28 — no `tags` field):
```tsx
export type TestCase = {
  ID: string;
  Назва: string;
  Передумови: string;
  Кроки: string[];
  "Очікуваний результат": string;
  Пріоритет: "High" | "Medium" | "Low";
};
```

**Decision point (D-08):** Current JSON files (verified: checkout.json, catalog.json, coupons.json, auth.json) have NO `tags` field. D-09 states: if no detail answers exist, all cases for the module are included. For v1, the simplest approach is ID-based filtering hardcoded in the generation logic (e.g., exclude TC-CHK-003 when `hasGuestCheckout: false`) rather than extending TestCase type and all 10 JSON files.

**If tags approach is chosen, extend as:**
```tsx
export type TestCase = {
  ID: string;
  Назва: string;
  Передумови: string;
  Кроки: string[];
  "Очікуваний результат": string;
  Пріоритет: "High" | "Medium" | "Low";
  tags?: string[];   // optional — absent = included in all filter scenarios
};
```

**Recommendation for planner:** Use ID-range or ID-set exclusion in ResultsView filtering logic for v1 — avoids touching all 10 JSON files and the TestCase type. Planner to decide and document.

---

### `src/constants/wizard-config.ts` (config, modify)

**Analog:** `src/constants/wizard-config.ts` itself

**Existing module ID arrays** (lines 18–39):
```tsx
export const ECOMMERCE_MODULES = [
  { id: "catalog",  label: "Каталог товарів" },
  { id: "product",  label: "Сторінка товару" },
  { id: "cart",     label: "Кошик" },
  { id: "checkout", label: "Checkout" },
  { id: "auth",     label: "Особистий кабінет" },
  { id: "blog",     label: "Блог" },
  { id: "search",   label: "Пошук" },
  { id: "filter",   label: "Фільтрація" },
  { id: "compare",  label: "Порівняння товарів" },
  { id: "wishlist", label: "Список бажань" },
] as const;
```

**TC-prefix mapping to add** — confirmed from actual JSON filenames and first IDs:

| JSON File | Module ID | TC-prefix |
|-----------|-----------|-----------|
| `catalog.json` | `catalog` | `TC-CAT` |
| `product.json` | `product` | `TC-PDP` |
| `cart.json` | `cart` | `TC-CART` |
| `checkout.json` | `checkout` | `TC-CHK` |
| `coupons.json` | *(no direct module — detail of checkout, hasPromoCode)* | `TC-CPN` |
| `auth.json` | `auth` | `TC-AUTH` |
| `blog.json` | `blog` | `TC-BLOG` |
| `search.json` | `search` | `TC-SRCH` |
| `contact-form.json` | `contact-form` | `TC-FORM` |
| `multilang.json` | `multilang` | `TC-LANG` |

**Note on `coupons.json` / TC-CPN:** This file has no corresponding module ID in ECOMMERCE_MODULES or INFOSITE_MODULES. These cases belong to `checkout` module and are gated by `hasPromoCode: true`. They should be included in the checkout group when `hasPromoCode` is true. The `checkout` module maps to both `TC-CHK` AND `TC-CPN` (when promo code is enabled).

**No JSON files exist for:** `filter`, `compare`, `wishlist`, `subscription`, `gallery`. These modules have no test cases in the data directory yet — planner must note this gap.

**Mapping constant to add in wizard-config.ts** (follow existing `as const` pattern):
```tsx
// Module ID → TC-prefix(es). Values are arrays to support multi-file modules (e.g. checkout + coupons).
export const MODULE_TC_PREFIXES: Record<string, string[]> = {
  catalog:       ["TC-CAT"],
  product:       ["TC-PDP"],
  cart:          ["TC-CART"],
  checkout:      ["TC-CHK"],   // TC-CPN added conditionally when hasPromoCode: true
  auth:          ["TC-AUTH"],
  blog:          ["TC-BLOG"],
  search:        ["TC-SRCH"],
  filter:        [],            // no JSON yet
  compare:       [],            // no JSON yet
  wishlist:      [],            // no JSON yet
  "contact-form": ["TC-FORM"],
  subscription:  [],            // no JSON yet
  gallery:       [],            // no JSON yet
  multilang:     ["TC-LANG"],
};

// Coupon prefix — included for checkout when hasPromoCode is true
export const PROMO_TC_PREFIX = "TC-CPN";
```

**Display name map to add** (from UI-SPEC Module Name Display Map):
```tsx
export const MODULE_DISPLAY_NAMES: Record<string, string> = {
  catalog:       "Каталог товарів",
  product:       "Сторінка товару",
  cart:          "Кошик",
  checkout:      "Checkout",
  auth:          "Особистий кабінет",
  blog:          "Блог",
  search:        "Пошук",
  filter:        "Фільтрація",
  compare:       "Порівняння товарів",
  wishlist:      "Список бажань",
  "contact-form": "Контактна форма",
  subscription:  "Підписка на розсилку",
  gallery:       "Галерея",
  multilang:     "Багатомовність",
};
```

These are derived from ECOMMERCE_MODULES and INFOSITE_MODULES labels already in the file — no new strings, just a flat lookup map.

---

### `data/test-cases/*.json` (data, possibly modify)

**Analog:** `data/test-cases/checkout.json` (verified structure)

**Confirmed current structure** (checkout.json lines 1–14 — representative):
```json
{
  "ID": "TC-CHK-001",
  "Назва": "...",
  "Передумови": "...",
  "Кроки": ["step 1", "step 2"],
  "Очікуваний результат": "...",
  "Пріоритет": "High"
}
```

**No `tags` field present** in any verified file. Modification decision deferred to planner (see types.ts section above). If ID-based filtering is chosen for v1, no JSON files need modification.

---

## Shared Patterns

### Wizard Step Container Layout
**Source:** All step components (`StepProjectType.tsx` line 19, `StepModules.tsx` line 28, `StepDetails.tsx` line 13)
**Apply to:** `ResultsView.tsx` outer div
```tsx
<div className="px-8 py-6">
```

### `cn()` Utility Import
**Source:** `src/lib/utils.ts` lines 1–4, used in `StepProjectType.tsx` line 4, `StepModules.tsx` line 4
**Apply to:** `PriorityBadge.tsx`
```tsx
import { cn } from "@/lib/utils";
```

### Sonner Toast Pattern
**Source:** `src/components/wizard/Wizard.tsx` lines 4, 23–24
**Apply to:** `ResultsView.tsx` copy markdown button handler
```tsx
import { toast } from "sonner";
toast.error("...");  // existing pattern
toast.success("Markdown скопійовано в буфер обміну");  // Phase 3 addition
```

### Toaster Component — Already Mounted
**Source:** `src/app/layout.tsx` line 34
**Apply to:** No new Toaster needed — do not add `<Toaster>` in any Phase 3 component
```tsx
<Toaster theme="dark" position="bottom-right" />
```

### Button Variants in Use
**Source:** `src/components/ui/button.tsx` (buttonVariants) + `src/components/wizard/WizardNav.tsx` lines 55–76
**Apply to:** Action buttons in `ResultsView.tsx`

WizardNav establishes the established variant usage:
```tsx
// outline (secondary action):
<Button variant="outline" className="border-border bg-transparent text-foreground hover:bg-secondary hover:text-foreground">
// primary (main action):
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
```

Phase 3 button variants (per UI-SPEC):
```tsx
// Copy Markdown — primary:
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-semibold rounded-md">
// Download .md — outline with accent:
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10 h-10 px-6 text-sm font-semibold rounded-md">
// Export Notion — neutral outline:
<Button variant="outline" className="border-border text-foreground hover:bg-secondary h-10 px-6 text-sm font-semibold rounded-md">
// Restart — ghost:
<Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10 px-6 text-sm font-semibold rounded-md">
```

### `"use client"` + Named Export Pattern
**Source:** `src/components/wizard/WizardNav.tsx` lines 1, 32 (named export `export default function`)
**Apply to:** `ResultsView.tsx` (needs `"use client"` for clipboard API, toast, event handlers), `PriorityBadge.tsx`

Named export convention for sub-components (PriorityBadge used inside ResultsView):
```tsx
// WizardNav uses default export. PriorityBadge should use named export per UI-SPEC:
export function PriorityBadge(...) { ... }
// ResultsView as default export (consumed by Wizard.tsx like other step components):
export default function ResultsView(...) { ... }
```

### Tailwind v4 Dark Theme Tokens
**Source:** `src/app/layout.tsx` + globals.css (referenced in code_context)
**Apply to:** All Phase 3 components

Confirmed token usage from existing components:
- `bg-background` / `bg-card` — backgrounds
- `text-foreground` / `text-muted-foreground` — text hierarchy
- `border-border` — borders
- `bg-primary` / `text-primary` / `text-primary-foreground` — accent green (#3ecf8e)
- `hover:bg-secondary` / `hover:bg-secondary/50` — hover states

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Markdown generation logic (inside ResultsView) | utility (inline) | transform | No markdown generation exists in codebase — use D-10 spec: steps joined with `<br>` in table cells, `## Module (N)` group headings |
| CSV generation logic (inside ResultsView) | utility (inline) | transform | No CSV generation exists — use D-11/D-12 spec: steps joined with `\n`, UTF-8 BOM prefix, English column headers |

---

## Key Data Findings for Planner

### TC-Prefix Map (verified from actual JSON files)
```
catalog.json       → TC-CAT   (module: catalog)
product.json       → TC-PDP   (module: product)
cart.json          → TC-CART  (module: cart)
checkout.json      → TC-CHK   (module: checkout, base cases)
coupons.json       → TC-CPN   (module: checkout, hasPromoCode: true cases only)
auth.json          → TC-AUTH  (module: auth)
blog.json          → TC-BLOG  (module: blog)
search.json        → TC-SRCH  (module: search)
contact-form.json  → TC-FORM  (module: contact-form)
multilang.json     → TC-LANG  (module: multilang)
```

### Missing JSON Files (modules with no test cases yet)
`filter`, `compare`, `wishlist`, `subscription`, `gallery` — these 5 module IDs have no corresponding JSON in `data/test-cases/`. When selected, these modules will produce an empty case array. Planner should decide: show empty module block, hide module block, or create placeholder JSON files.

### Tags Field Status
**Absent** from all verified JSON files (checkout.json, catalog.json, coupons.json, auth.json). Adding tags requires modifying 10 JSON files + TestCase type. For v1, ID-based filtering (case-ID allowlist/blocklist per detail flag) is the lower-effort alternative.

### Toaster Configuration
Already mounted at `src/app/layout.tsx:34` with `theme="dark" position="bottom-right"`. Matches UI-SPEC exactly. No changes needed.

---

## Metadata

**Analog search scope:** `src/components/wizard/`, `src/components/ui/`, `src/lib/`, `src/constants/`, `src/app/`, `data/test-cases/`
**Files scanned:** 25 source files + 10 JSON data files
**Pattern extraction date:** 2026-06-07
