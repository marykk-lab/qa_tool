# Phase 2: Wizard — Research

**Researched:** 2026-06-04
**Domain:** React multi-step wizard, shadcn/ui + Tailwind v4, JSON test case library
**Confidence:** HIGH

---

## Summary

Phase 2 builds the full multi-step selection wizard on top of the Phase 1 scaffold. The
wizard has a branching structure: Step 1 picks project type, which determines the platform
options in Step 2 and the module list in Step 3. Step 4 is conditional — it appears only
when the user has selected specific modules that require additional detail questions. All
wizard state is ephemeral (no persistence between sessions is required for v1), making
plain React `useState` with a single `WizardState` object the right choice. No routing
library, URL params, or global state manager is needed.

shadcn/ui now officially supports Tailwind v4 via its CLI (`npx shadcn@latest init`). The
init command installs `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`,
and `lucide-react`, adds a `components.json` config file, adds a `src/lib/utils.ts` `cn()`
helper, and extends `globals.css` with `@theme inline {}` CSS variable bindings. All seven
required components (Button, Card, Badge, Checkbox, RadioGroup, Progress, Sonner) are
available and individually installable.

The JSON library for 10 modules must be created in this phase (GEN-01, GEN-03, GEN-04).
Each module gets its own file (e.g., `catalog.json`, `checkout.json`) holding an array of
`TestCase` objects with the correct ID prefixes. Realistic Ukrainian-language content with
4-6 test cases per module is sufficient for Phase 2; Phase 3 generation picks from this
library based on wizard selections.

**Primary recommendation:** Build the wizard as a single `"use client"` page component
with `useState` holding a typed `WizardState` object, render one step component at a time
keyed by `currentStep`, and install shadcn/ui via `npx shadcn@latest init` followed by
individual `npx shadcn@latest add` calls for each needed component.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Wizard state (step, selections) | Browser / Client | — | Ephemeral per-session, no server needed; "use client" page component with useState |
| Step rendering / branching logic | Browser / Client | — | Pure UI logic driven by current step and project type selection |
| Test case JSON library | Static files (repo) | Server Component (loader) | JSON at /data/test-cases/; server reads via fs at render time (established Phase 1 pattern) |
| shadcn/ui component rendering | Browser / Client | — | All shadcn components are client-rendered |
| Sonner toasts | Browser / Client | Layout (Toaster mount) | Toaster placed in layout.tsx; toast() called from wizard on validation events |
| Progress indicator | Browser / Client | — | Pure derivation from currentStep / totalSteps state |
| Navigation validation ("Далі" gate) | Browser / Client | — | Inline guard in handleNext() — check required selections before advancing |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIZ-01 | Користувач може обрати тип проекту на першому кроці (E-commerce або Інформаційний сайт) | Step 1 RadioGroup; selection stored in WizardState.projectType |
| WIZ-02 | E-commerce: користувач обирає платформу (WooCommerce / Shopify / Інша) | Step 2a RadioGroup; rendered conditionally when projectType === "ecommerce" |
| WIZ-03 | E-commerce: модулі зі списку (множинний вибір, 10 варіантів) | Step 3a Checkbox group; 10 defined module constants |
| WIZ-04 | E-commerce: деталізуючі питання для Checkout / Особистий кабінет / Пошук | Step 4 conditional; rendered only if qualifying modules selected |
| WIZ-05 | Інформаційний сайт: платформа (WordPress / Інша) | Step 2b RadioGroup; rendered when projectType === "infosite" |
| WIZ-06 | Інформаційний сайт: модулі (7 варіантів) | Step 3b Checkbox group; 7 defined module constants |
| WIZ-07 | Інформаційний сайт: деталізуючі питання для Контактна форма / Багатомовність | Step 4 conditional; rendered only if qualifying modules selected |
| WIZ-08 | "Назад" повертає до попереднього кроку зі збереженим станом; "Далі" блокується без вибору | handleBack() decrements step; handleNext() guards on required field presence |
| WIZ-09 | Прогрес-індикатор "Крок N з M" на кожному кроці | Derived from currentStep + computed totalSteps (3 or 4 depending on detail step presence) |
| GEN-01 | Бібліотека тест кейсів у JSON-файлах у /data/test-cases/ | 10 module JSON files; each is an array of TestCase objects |
| GEN-03 | Кожен тест кейс має поля: ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет | Already locked by Phase 1 types.ts schema; JSON files must comply |
| GEN-04 | ID-префікси: TC-CAT, TC-PDP, TC-CART, TC-CHK, TC-AUTH, TC-SRCH, TC-BLOG, TC-FORM, TC-LANG, TC-CPN | One JSON file per module; prefix applied to all IDs in that file |
| UI-03 | shadcn/ui компоненти: Button, Card, Badge, Checkbox, RadioGroup, Progress, Sonner | All 7 verified available via npx shadcn@latest add; install in Wave 0 |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 16.2.7 (installed) | Routing, server/client split | Already in project; Phase 1 decision |
| React | 19.2.4 (installed) | UI rendering | Already in project |
| Tailwind CSS v4 | 4.3.0 (installed) | Styling | Already in project; v4 `@import "tailwindcss"` |
| shadcn/ui CLI | 4.10.0 (npm latest) | Component scaffolding — copies component source into repo | Matches UI-03; officially supports Tailwind v4 [CITED: ui.shadcn.com/docs/tailwind-v4] |
| class-variance-authority | 0.7.1 | Variant-based className composition (used by shadcn components) | shadcn/ui dependency [CITED: ui.shadcn.com/docs/installation/manual] |
| clsx | 2.1.1 | Conditional class merging | shadcn/ui dependency |
| tailwind-merge | 3.6.0 | Tailwind class deduplication | shadcn/ui dependency; required for `cn()` helper |
| lucide-react | 1.17.0 | Icon set used by shadcn components | shadcn/ui dependency |
| tw-animate-css | 1.4.0 | CSS animations for shadcn components under Tailwind v4 | Replaces tailwindcss-animate for v4 [CITED: ui.shadcn.com/docs/installation/manual] |
| sonner | 2.0.7 | Toast notification library | shadcn/ui Sonner component wraps this [CITED: ui.shadcn.com/docs/components/radix/sonner] |

[VERIFIED: npm registry] — all versions confirmed via `npm view <pkg> version` in this session.

### shadcn/ui Components Needed (UI-03)

| Component | Install Command | Radix Peer Dep | Purpose in Wizard |
|-----------|----------------|----------------|-------------------|
| Button | `npx shadcn@latest add button` | @radix-ui/react-slot | Назад / Далі navigation |
| Card | `npx shadcn@latest add card` | none | Step wrapper container |
| Badge | `npx shadcn@latest add badge` | none | Priority display, selection chips |
| Checkbox | `npx shadcn@latest add checkbox` | @radix-ui/react-checkbox 1.3.3 | Module multi-select (WIZ-03, WIZ-06) |
| RadioGroup | `npx shadcn@latest add radio-group` | @radix-ui/react-radio-group 1.3.8 | Project type / platform single-select |
| Progress | `npx shadcn@latest add progress` | @radix-ui/react-progress 1.1.8 | "Крок N з M" visual bar |
| Sonner | `npx shadcn@latest add sonner` | sonner 2.0.7 | Toast notifications |

[VERIFIED: npm registry] — Radix peer versions confirmed via `npm view` in this session.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useState for wizard state | URL search params / nuqs | URL params give shareability and reload-persistence, but wizard selections are ephemeral — no sharing requirement in v1. useState is simpler and avoids a dependency. |
| useState for wizard state | Zustand / Jotai | Global state libraries add overhead; state is fully local to the wizard page in v1. |
| shadcn/ui RadioGroup | Native `<input type="radio">` | shadcn/ui components satisfy UI-03 explicitly; native would need manual styling to match Feedboon dark theme. |
| Per-module JSON arrays | Single large JSON | Per-module files allow QA to edit one module without touching others (GEN-01 intent). |

**Installation (all new packages, Wave 0):**
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge checkbox radio-group progress sonner
```

---

## Package Legitimacy Audit

> slopcheck was unavailable in this environment. All packages below are tagged [ASSUMED] and the planner must gate each install behind a `checkpoint:human-verify` task OR rely on the official source confirmation below.

Note: All packages below are either (a) the official shadcn CLI itself, (b) official Radix UI primitives, or (c) packages explicitly listed in shadcn/ui's official documentation at `ui.shadcn.com/docs/installation/manual`. Given this authoritative sourcing, risk is LOW despite slopcheck unavailability.

| Package | Registry | Source | slopcheck | Disposition |
|---------|----------|--------|-----------|-------------|
| shadcn | npm | Official shadcn CLI — ui.shadcn.com | unavailable | [ASSUMED] Approved — official CLI |
| class-variance-authority | npm | Listed in ui.shadcn.com/docs | unavailable | [ASSUMED] Approved — official dep |
| clsx | npm | Listed in ui.shadcn.com/docs | unavailable | [ASSUMED] Approved — official dep |
| tailwind-merge | npm | Listed in ui.shadcn.com/docs | unavailable | [ASSUMED] Approved — official dep |
| lucide-react | npm | Listed in ui.shadcn.com/docs | unavailable | [ASSUMED] Approved — official dep |
| tw-animate-css | npm | Listed in ui.shadcn.com/docs (Tailwind v4 variant of tailwindcss-animate) | unavailable | [ASSUMED] Approved — official dep |
| sonner | npm | Listed in ui.shadcn.com/docs/components/radix/sonner | unavailable | [ASSUMED] Approved — official dep |
| @radix-ui/react-checkbox | npm | Radix UI official primitive | unavailable | [ASSUMED] Approved |
| @radix-ui/react-radio-group | npm | Radix UI official primitive | unavailable | [ASSUMED] Approved |
| @radix-ui/react-progress | npm | Radix UI official primitive | unavailable | [ASSUMED] Approved |
| @radix-ui/react-slot | npm | Radix UI official primitive | unavailable | [ASSUMED] Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as [SUS]:** none

*slopcheck was unavailable — all packages tagged [ASSUMED]. The planner should add a single `checkpoint:human-verify` before the `npx shadcn@latest init` task, confirming the CLI and packages are from official shadcn sources.*

---

## Architecture Patterns

### System Architecture Diagram

```
User Browser
     │
     ▼
[src/app/page.tsx]  ← Server Component (thin wrapper)
     │ renders
     ▼
[src/components/wizard/Wizard.tsx]  ← "use client" — owns all wizard state
     │
     ├── currentStep: 1..4
     ├── wizardState: WizardState object
     │
     ├─── step === 1 ──► [StepProjectType]   RadioGroup: E-commerce | Інфо-сайт
     │
     ├─── step === 2 ──► [StepPlatform]      RadioGroup: branches on projectType
     │                   (E-com: WooCommerce/Shopify/Інша)
     │                   (Info: WordPress/Інша)
     │
     ├─── step === 3 ──► [StepModules]       Checkbox list: branches on projectType
     │                   (E-com: 10 modules)
     │                   (Info: 7 modules)
     │
     └─── step === 4 ──► [StepDetails]       Conditional — only if qualifying modules selected
                         (E-com: Checkout/Auth/Search sub-questions)
                         (Info: ContactForm/Multilang sub-questions)
                         [SKIPPED if no qualifying modules]

     At every step:
     ├── [ProgressBar]   "Крок N з M" + shadcn Progress
     └── [NavButtons]    Назад (disabled on step 1) | Далі (disabled if required empty)

JSON Library (static, read at server render for Phase 3):
/data/test-cases/
  ├── catalog.json      # TC-CAT-xxx  Каталог товарів
  ├── product.json      # TC-PDP-xxx  Сторінка товару
  ├── cart.json         # TC-CART-xxx Кошик
  ├── checkout.json     # TC-CHK-xxx  Checkout
  ├── auth.json         # TC-AUTH-xxx Авторизація / Особистий кабінет
  ├── search.json       # TC-SRCH-xxx Пошук
  ├── blog.json         # TC-BLOG-xxx Блог
  ├── contact-form.json # TC-FORM-xxx Контактна форма
  ├── multilang.json    # TC-LANG-xxx Багатомовність
  └── coupons.json      # TC-CPN-xxx  Купони / Промокоди
```

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx              # Thin server shell → renders <Wizard />
│   ├── layout.tsx            # Add <Toaster /> here for Sonner
│   └── globals.css           # shadcn init extends with @theme inline + CSS vars
├── components/
│   ├── wizard/
│   │   ├── Wizard.tsx        # "use client" — owns WizardState + currentStep
│   │   ├── StepProjectType.tsx
│   │   ├── StepPlatform.tsx
│   │   ├── StepModules.tsx
│   │   ├── StepDetails.tsx
│   │   └── WizardNav.tsx     # Назад/Далі buttons + progress display
│   ├── ui/                   # shadcn copies components here
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── progress.tsx
│   │   └── sonner.tsx
│   └── TestCaseCard.tsx      # Existing; untouched in Phase 2
├── lib/
│   ├── types.ts              # Existing TestCase type + NEW WizardState type
│   ├── test-cases.ts         # Existing JSON loader; NEW loadModuleTestCases()
│   └── utils.ts              # NEW — cn() helper added by shadcn init
└── constants/
    └── wizard-config.ts      # Module lists, platform options, detail questions
data/
└── test-cases/               # 10 module JSON files (arrays of TestCase)
```

### Pattern 1: WizardState Type

**What:** A single typed object holds all wizard selections. Passed down as props (or via context if step components grow large).
**When to use:** Always — it is the single source of truth for the wizard.

```typescript
// src/lib/types.ts — extend existing file

export type ProjectType = "ecommerce" | "infosite";

export type EcommercePlatform = "woocommerce" | "shopify" | "other";
export type InfositePlatform = "wordpress" | "other";

export type EcommerceModule =
  | "catalog" | "product" | "cart" | "checkout"
  | "auth" | "blog" | "search" | "filter" | "compare" | "wishlist";

export type InfositeModule =
  | "blog" | "search" | "contact-form" | "subscription"
  | "gallery" | "multilang" | "auth";

// Detail sub-answers (Phase 2 collects; Phase 3 uses for filtering)
export type CheckoutDetails = {
  hasGuestCheckout: boolean;
  hasPromoCode: boolean;
};
export type AuthDetails = {
  hasSocialLogin: boolean;
  hasOrderHistory: boolean;
};
export type SearchDetails = {
  hasAutoComplete: boolean;
  hasFiltersInResults: boolean;
};
export type ContactFormDetails = {
  hasFileUpload: boolean;
  hasCaptcha: boolean;
};
export type MultilangDetails = {
  languageCount: number; // 2 | 3 | "more"
};

export type WizardState = {
  projectType: ProjectType | null;
  platform: EcommercePlatform | InfositePlatform | null;
  modules: string[];           // module IDs selected
  checkoutDetails: CheckoutDetails | null;
  authDetails: AuthDetails | null;
  searchDetails: SearchDetails | null;
  contactFormDetails: ContactFormDetails | null;
  multilangDetails: MultilangDetails | null;
};

export const INITIAL_WIZARD_STATE: WizardState = {
  projectType: null,
  platform: null,
  modules: [],
  checkoutDetails: null,
  authDetails: null,
  searchDetails: null,
  contactFormDetails: null,
  multilangDetails: null,
};
```

[ASSUMED] — WizardState shape is derived from requirements analysis, not fetched from external docs.

### Pattern 2: Step Computation (Branching)

**What:** Compute total step count and whether step 4 should appear based on current state.
**When to use:** In `Wizard.tsx` to drive progress indicator and Next/Back logic.

```typescript
// src/constants/wizard-config.ts

// Modules that trigger detail questions for E-commerce
export const ECOM_DETAIL_MODULES = ["checkout", "auth", "search"] as const;

// Modules that trigger detail questions for Info site
export const INFO_DETAIL_MODULES = ["contact-form", "multilang"] as const;

export function hasDetailStep(state: WizardState): boolean {
  if (!state.projectType || state.modules.length === 0) return false;
  const detailTriggers =
    state.projectType === "ecommerce" ? ECOM_DETAIL_MODULES : INFO_DETAIL_MODULES;
  return state.modules.some((m) => detailTriggers.includes(m as never));
}

export function getTotalSteps(state: WizardState): number {
  // 3 base steps + optional detail step
  return hasDetailStep(state) ? 4 : 3;
}
```

[ASSUMED]

### Pattern 3: shadcn/ui Init for Tailwind v4

**What:** `npx shadcn@latest init` on an existing Tailwind v4 project creates `components.json`, adds `src/lib/utils.ts`, and extends `globals.css` with `@theme inline {}` CSS variable block. For Tailwind v4, `tailwind.config` field in `components.json` is left blank.
**When to use:** Wave 0, before any component work.

```json
// components.json — generated by shadcn init (Tailwind v4 variant)
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

[CITED: ui.shadcn.com/docs/components-json]

### Pattern 4: Wizard Navigation Guard

**What:** "Далі" button is disabled (or triggers a Sonner toast) when the required selection for the current step is empty.
**When to use:** In `WizardNav.tsx` — derive `canAdvance` from step + state.

```typescript
// src/components/wizard/WizardNav.tsx — simplified logic
function canAdvance(step: number, state: WizardState): boolean {
  switch (step) {
    case 1: return state.projectType !== null;
    case 2: return state.platform !== null;
    case 3: return state.modules.length > 0;
    case 4: return true; // details are optional sub-questions
    default: return false;
  }
}
```

[ASSUMED]

### Pattern 5: Sonner Setup in layout.tsx

**What:** `<Toaster />` is mounted once in `layout.tsx`. Individual steps call `toast()` from `"sonner"`.
[CITED: ui.shadcn.com/docs/components/radix/sonner]

```tsx
// src/app/layout.tsx — add Toaster
import { Toaster } from "@/components/ui/sonner";
// inside RootLayout body:
<body className="min-h-full flex flex-col">
  {children}
  <Toaster />
</body>
```

### Anti-Patterns to Avoid

- **Routing between steps as pages:** Do not create `/wizard/step-1`, `/wizard/step-2` routes. The wizard is a single-page component — step changes are pure state transitions, not navigation events. URL routing adds complexity and breaks WIZ-08 back-navigation simplicity.
- **Storing wizard state in URL params:** No shareability requirement in v1; URL params add serialization boilerplate for no benefit here.
- **Fetching JSON in client components:** The test case JSON is read via Node `fs` in server context (established Phase 1 pattern). Client components receive data as props; they do not `fetch()` JSON files at runtime.
- **One giant Wizard component:** Split rendering into StepProjectType, StepPlatform, StepModules, StepDetails — each receives only the props it needs. Keeps files testable and readable.
- **Running `shadcn init` with `--defaults` / `-y` flag blindly:** The init command will ask which style (new-york vs default) and baseColor — answer "new-york" and "neutral" to match Feedboon aesthetic; the defaults may differ.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible radio buttons with keyboard nav | Custom `<div onClick>` radio | `shadcn RadioGroup` (Radix) | Radix handles focus management, arrow-key navigation, aria-checked — non-trivial to replicate correctly |
| Accessible checkboxes with indeterminate state | `<input type="checkbox">` with manual styling | `shadcn Checkbox` (Radix) | Radix handles aria-checked="indeterminate", keyboard events, controlled/uncontrolled modes |
| Progress bar | `<div style={{width: N%}}>` | `shadcn Progress` | Radix Progress has correct role="progressbar" aria attributes |
| Toast notifications | Custom modal/alert | `shadcn Sonner` | Animation, stacking, auto-dismiss, promise-state built-in |
| Class name merging | String concatenation | `cn()` from `tailwind-merge` + `clsx` | Tailwind class conflicts (e.g., two `p-*` classes) are silently ignored without twMerge |

**Key insight:** In Tailwind v4 projects, className collision is a common bug — `cn()` is mandatory for any component with conditional classes.

---

## JSON Test Case Library (GEN-01, GEN-03, GEN-04)

### File-per-Module Convention

Each file is an array of `TestCase` objects. The loader (`loadAllTestCases`) already reads all `*.json` files; Phase 3 generation will filter by ID prefix.

```
/data/test-cases/
├── catalog.json       # TC-CAT-001 … TC-CAT-00N  (Каталог товарів)
├── product.json       # TC-PDP-001 … TC-PDP-00N  (Сторінка товару)
├── cart.json          # TC-CART-001 … TC-CART-00N (Кошик)
├── checkout.json      # TC-CHK-001 … TC-CHK-00N  (Checkout)
├── auth.json          # TC-AUTH-001 … TC-AUTH-00N (Авторизація)
├── search.json        # TC-SRCH-001 … TC-SRCH-00N (Пошук)
├── blog.json          # TC-BLOG-001 … TC-BLOG-00N (Блог)
├── contact-form.json  # TC-FORM-001 … TC-FORM-00N (Контактна форма)
├── multilang.json     # TC-LANG-001 … TC-LANG-00N (Багатомовність)
└── coupons.json       # TC-CPN-001 … TC-CPN-00N  (Купони)
```

`sample.json` already exists and contains `TC-CAT-001` as a single object — it will be replaced by `catalog.json` (array format) during Phase 2. The loader already handles both; the planner should include a step to delete `sample.json` or rename it.

### Recommended Test Case Count per Module

Aim for 4-6 realistic Ukrainian-language test cases per module. This keeps JSON files authoring time bounded in Phase 2 while giving Phase 3 enough material for a meaningful output table.

| Module | File | Prefix | Suggested Count |
|--------|------|--------|----------------|
| Каталог товарів | catalog.json | TC-CAT | 5 |
| Сторінка товару | product.json | TC-PDP | 5 |
| Кошик | cart.json | TC-CART | 4 |
| Checkout | checkout.json | TC-CHK | 6 |
| Авторизація | auth.json | TC-AUTH | 5 |
| Пошук | search.json | TC-SRCH | 4 |
| Блог | blog.json | TC-BLOG | 4 |
| Контактна форма | contact-form.json | TC-FORM | 4 |
| Багатомовність | multilang.json | TC-LANG | 4 |
| Купони | coupons.json | TC-CPN | 4 |

### JSON File Format

Each file is a JSON **array** (not a single object like `sample.json`):

```json
[
  {
    "ID": "TC-CHK-001",
    "Назва": "Успішне оформлення замовлення авторизованим користувачем",
    "Передумови": "Користувач авторизований. У кошику є хоча б один товар.",
    "Кроки": [
      "Перейти до кошика",
      "Натиснути 'Оформити замовлення'",
      "Заповнити дані доставки",
      "Обрати спосіб оплати",
      "Натиснути 'Підтвердити замовлення'"
    ],
    "Очікуваний результат": "Замовлення успішно оформлено. Відображається сторінка підтвердження з номером замовлення. На email приходить підтвердження.",
    "Пріоритет": "High"
  }
]
```

### Note on `loadAllTestCases()` Compatibility

The existing loader at `src/lib/test-cases.ts` calls `JSON.parse(raw) as TestCase` — it expects a single object per file. The loader MUST be updated to handle arrays: `JSON.parse(raw) as TestCase | TestCase[]` and then flatten. This is a required change in Phase 2 (Task for updating the loader).

[ASSUMED] — array format vs single-object format is an architectural decision, not verified from external docs. The array format is the natural choice for multiple test cases per module.

---

## Common Pitfalls

### Pitfall 1: shadcn init Overwrites globals.css Unexpectedly

**What goes wrong:** `npx shadcn@latest init` appends new `@theme inline {}` and CSS variable blocks to `globals.css`. If the existing file already has a `@theme inline` block (it does — see current globals.css), there will be duplicate blocks.
**Why it happens:** The init command appends rather than merges in some CLI versions.
**How to avoid:** Before running `shadcn init`, read `globals.css` carefully. After init, reconcile any duplicate `@theme inline` blocks manually. The shadcn-generated variables (oklch colors for --background, --foreground, --primary, --border, etc.) should be kept; the existing minimal `@theme inline` block should be merged or replaced.
**Warning signs:** Build warnings about duplicate CSS custom properties; unexpected color overrides.

### Pitfall 2: `loadAllTestCases()` Assumes Single-Object JSON

**What goes wrong:** Phase 1 loader does `JSON.parse(raw) as TestCase` — works for `sample.json` (single object). When Phase 2 replaces with array-format files, the loader returns `TestCase[]` cast as `TestCase`, causing downstream type errors or incorrect data.
**Why it happens:** Phase 1 was designed for one sample file; array files were anticipated for Phase 2 but the loader was not updated.
**How to avoid:** Update `loadAllTestCases()` in Wave 0/Task 1 to handle both `TestCase` and `TestCase[]` from each file, always returning a flat `TestCase[]`.
**Warning signs:** TypeScript errors on `testCase.ID` (becomes `undefined` when the parse returns an array treated as object).

### Pitfall 3: Step 4 Not Skipped When No Qualifying Modules

**What goes wrong:** User selects modules that do NOT trigger detail questions, hits "Далі" on step 3, and lands on an empty step 4. Or worse, the progress indicator says "Крок 4 з 4" but there is nothing to fill in.
**Why it happens:** If `hasDetailStep()` check is not run inside `handleNext()`, step always advances by 1.
**How to avoid:** In `handleNext()`, after step 3, call `hasDetailStep(state)`. If false, skip to step 5 (which is the completion signal). Total step count must also be recalculated on every module selection change.
**Warning signs:** Empty step 4 renders; progress indicator miscounts.

### Pitfall 4: shadcn Checkbox `checked` vs `onCheckedChange` API

**What goes wrong:** Developer treats shadcn Checkbox like native `<input type="checkbox">` with `onChange`. shadcn Checkbox uses `checked: boolean | "indeterminate"` and `onCheckedChange: (checked: boolean | "indeterminate") => void`.
**Why it happens:** API differs from native HTML input.
**How to avoid:** Type-guard the `onCheckedChange` callback: `if (checked === true) addModule(id); else removeModule(id)`.
**Warning signs:** TypeScript error "Argument of type 'boolean | "indeterminate"' is not assignable to parameter of type 'boolean'".

### Pitfall 5: RadioGroup Value Must be String

**What goes wrong:** TypeScript union types like `"ecommerce" | "infosite"` are used directly as RadioGroup values. shadcn RadioGroup `value` prop is `string` — no issue — but the `onValueChange` callback returns `string`, requiring a cast back to the union type.
**Why it happens:** Type inference loses the literal type.
**How to avoid:** Use a type assertion or type guard: `onValueChange={(v) => setState(prev => ({...prev, projectType: v as ProjectType}))}`.

### Pitfall 6: Tailwind v4 `@theme inline` vs `@theme` — shadcn requires `inline`

**What goes wrong:** shadcn/ui CSS variable utilities (`bg-background`, `text-foreground`) require `@theme inline {}` (not just `@theme {}`). Using bare `@theme {}` causes the CSS variables to not be mapped to Tailwind utilities.
**Why it happens:** Tailwind v4 `@theme inline` is a specific directive that maps CSS custom properties to utilities without generating additional output; `@theme` alone has different semantics.
**How to avoid:** Ensure `globals.css` uses `@theme inline { --color-background: var(--background); ... }` after shadcn init. [CITED: ui.shadcn.com/docs/tailwind-v4]

---

## Code Examples

### RadioGroup Usage (Step 1 — Project Type)

```tsx
// Source: ui.shadcn.com/docs/components/radix/radio-group
"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Props = {
  value: string | null;
  onChange: (value: string) => void;
};

export function StepProjectType({ value, onChange }: Props) {
  return (
    <RadioGroup value={value ?? ""} onValueChange={onChange}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ecommerce" id="ecommerce" />
        <Label htmlFor="ecommerce">E-commerce</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="infosite" id="infosite" />
        <Label htmlFor="infosite">Інформаційний сайт</Label>
      </div>
    </RadioGroup>
  );
}
```

### Checkbox Usage (Step 3 — Module Selection)

```tsx
// Source: ui.shadcn.com/docs/components/radix/checkbox (pattern)
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ModuleOption = { id: string; label: string };

type Props = {
  modules: ModuleOption[];
  selected: string[];
  onChange: (id: string, checked: boolean) => void;
};

export function ModuleCheckboxList({ modules, selected, onChange }: Props) {
  return (
    <div className="space-y-3">
      {modules.map((m) => (
        <div key={m.id} className="flex items-center space-x-2">
          <Checkbox
            id={m.id}
            checked={selected.includes(m.id)}
            onCheckedChange={(checked) => onChange(m.id, checked === true)}
          />
          <Label htmlFor={m.id}>{m.label}</Label>
        </div>
      ))}
    </div>
  );
}
```

### Progress Indicator

```tsx
// Source: ui.shadcn.com/docs/components/radix/progress (pattern)
import { Progress } from "@/components/ui/progress";

type Props = { current: number; total: number };

export function WizardProgress({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <p className="text-sm text-muted-foreground mb-2">
        Крок {current} з {total}
      </p>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
```

### Updated loadAllTestCases() for Array JSON Files

```typescript
// src/lib/test-cases.ts — updated loader
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

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwindcss-animate` plugin | `tw-animate-css` CSS package | Tailwind v4 release (early 2025) | shadcn/ui manual install now uses tw-animate-css instead of the plugin |
| `npx shadcn-ui@latest` | `npx shadcn@latest` | Aug 2024 changelog | Package renamed from `shadcn-ui` to `shadcn`; old command still works but deprecated |
| HSL CSS variables (`hsl(0 0% 100%)`) | OKLCH CSS variables | shadcn/ui 2025 update | New installs generate OKLCH-format variables; existing HSL projects still work |
| `toast` component | `sonner` component | shadcn/ui deprecation (2025) | `toast` component is deprecated; use `sonner` (UI-03 already specifies sonner) |

**Deprecated/outdated:**
- `npx shadcn-ui@latest init` — use `npx shadcn@latest init`
- `tailwindcss-animate` npm plugin — replaced by `tw-animate-css` for Tailwind v4

[CITED: ui.shadcn.com/docs/tailwind-v4], [CITED: ui.shadcn.com/docs/changelog/2024-08-npx-shadcn-init]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WizardState type shape (fields, detail sub-types) | Architecture Patterns / Pattern 1 | Planner builds tasks around this shape; changing it mid-phase requires touching Wizard.tsx and all step components |
| A2 | Array-format JSON files (one file = many TestCases) | JSON Library section | If single-object-per-file is preferred, 10x more files are needed; loader update task changes |
| A3 | 4-6 test cases per module is sufficient for Phase 2 | JSON Library section | Too few cases weakens Phase 3 output quality; too many adds authoring time |
| A4 | Step 4 details are "optional" sub-questions (can advance without filling) | Pattern 2 / Pitfall 3 | If details are required, canAdvance() logic for step 4 must change |
| A5 | shadcn init will NOT require breaking changes to existing globals.css | Pitfall 1 | Possible duplicate @theme block after init; manual reconciliation needed |
| A6 | `sample.json` will be deleted/replaced as part of catalog.json creation | JSON Library section | If kept alongside catalog.json, TC-CAT-001 will appear twice in loadAllTestCases() output |
| A7 | Detail questions use boolean checkboxes (has/doesn't have feature) | Pattern 1 types | If client prefers radio-style yes/no or count inputs, types and step components differ |

---

## Open Questions

1. **Detail step questions — exact content**
   - What we know: WIZ-04 says "деталізуючі питання" for Checkout/Auth/Search (E-com) and ContactForm/Multilang (Info)
   - What's unclear: The specific sub-questions are not defined in REQUIREMENTS.md or ROADMAP.md
   - Recommendation: Define boolean questions (e.g., "Чи є гостьовий checkout?", "Чи є вхід через соціальні мережі?") in `wizard-config.ts` as constants; the planner should include concrete sub-question content in the task action block

2. **What happens after step 4 (or step 3 if no details)?**
   - What we know: Phase 3 handles result display (OUT-01). Phase 2 only needs to "reach the final step with choices preserved."
   - What's unclear: Does Phase 2 need a placeholder "summary" or completion screen, or does it hand off directly to Phase 3's result component?
   - Recommendation: Phase 2 ends with a visual placeholder completion state ("Готово — перейти до результатів" button stub) that Phase 3 replaces with the real result table

3. **Coupon module (TC-CPN) — wizard visibility**
   - What we know: `TC-CPN` prefix is in GEN-04; `Купони/Промокоди` is not in the WIZ-03 10-module list
   - What's unclear: Is the Coupon module a sub-question of Checkout (when the user says "yes, I have promo codes") or a separate module choice in the wizard?
   - Recommendation: Treat `TC-CPN` as a Checkout detail (sub-question: "Чи є промокоди/купони?"); generate `coupons.json` but serve it only when checkoutDetails.hasPromoCode === true

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js / shadcn CLI | Yes | v20.10.0 | — |
| npm | Package install | Yes | 10.2.3 | — |
| npx | shadcn@latest init | Yes | bundled with npm | — |
| Internet (npm registry) | shadcn init / component add | Required at task time | — | Run offline after initial install |

**Missing dependencies with no fallback:** None — all required tools are present.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest 29 |
| Config file | jest.config.js (exists) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIZ-01 | projectType selection stored in WizardState | unit | `npm test -- --testPathPattern wizard-state` | No — Wave 0 |
| WIZ-08 | canAdvance() returns false when required selection empty | unit | `npm test -- --testPathPattern wizard-nav` | No — Wave 0 |
| WIZ-09 | getTotalSteps() returns 3 or 4 based on module selection | unit | `npm test -- --testPathPattern wizard-config` | No — Wave 0 |
| GEN-01 | loadAllTestCases() returns items from all 10 module JSON files | unit | `npm test -- --testPathPattern test-cases` | Yes (partial — existing test, extend it) |
| GEN-03 | All loaded TestCase objects have all 6 schema fields | unit | `npm test -- --testPathPattern test-cases` | Yes (extend existing) |
| GEN-04 | IDs from catalog.json start with TC-CAT; from checkout.json start with TC-CHK; etc. | unit | `npm test -- --testPathPattern test-cases` | No — Wave 0 |
| WIZ-02/03/04/05/06/07 | Step components render correct options for each projectType | manual smoke | `npm run dev` + browser | — |
| UI-03 | shadcn components render without errors | manual smoke | `npm run dev` + browser | — |

### Sampling Rate

- **Per task commit:** `npm test` (full suite, fast — only unit tests exist)
- **Per wave merge:** `npm test` + `npm run build`
- **Phase gate:** Full suite green + `npm run build` passes before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/wizard-state.test.ts` — covers WIZ-01 (WizardState shape, INITIAL_WIZARD_STATE)
- [ ] `src/__tests__/wizard-nav.test.ts` — covers WIZ-08 (canAdvance logic, step guard)
- [ ] `src/__tests__/wizard-config.test.ts` — covers WIZ-09 (getTotalSteps, hasDetailStep)
- [ ] Extend `src/__tests__/test-cases.test.ts` — covers GEN-04 (ID prefix validation per module file)

---

## Security Domain

> This is a client-only, no-auth, no-backend application. Standard web security hygiene applies.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in v1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Single-user local/Vercel app |
| V5 Input Validation | Minimal | Wizard selections are constrained to predefined constant values — no free-text user input in Phase 2 |
| V6 Cryptography | No | No secrets or sensitive data |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via dangerouslySetInnerHTML | Tampering | Wizard displays only predefined constant strings; no user-provided HTML rendered. Never use dangerouslySetInnerHTML in wizard components. |
| Prototype pollution via JSON.parse | Tampering | JSON files are in-repo static data, not user-supplied. Low risk; no additional mitigation needed. |

---

## Sources

### Primary (HIGH confidence)

- [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) — Tailwind v4 support, @theme inline directive, tw-animate-css replacement
- [ui.shadcn.com/docs/installation/manual](https://ui.shadcn.com/docs/installation/manual) — Exact package list for shadcn/ui manual install
- [ui.shadcn.com/docs/components-json](https://ui.shadcn.com/docs/components-json) — components.json format, Tailwind v4 config field behavior
- [ui.shadcn.com/docs/components/radix/sonner](https://ui.shadcn.com/docs/components/radix/sonner) — Sonner install command, Toaster setup in layout.tsx
- npm registry — All package versions verified via `npm view <pkg> version` during this session

### Secondary (MEDIUM confidence)

- [ui.shadcn.com/docs/installation/next](https://ui.shadcn.com/docs/installation/next) — CLI init command for Next.js projects
- Phase 1 SUMMARY.md — Confirmed stack versions, file paths, loader patterns, TestCase schema

### Tertiary (LOW confidence)

- WebSearch results for wizard state patterns — Used to confirm useState approach is idiomatic; not cited as authoritative

---

## Metadata

**Confidence breakdown:**
- shadcn/ui install: HIGH — directly verified against official docs
- Wizard state pattern (useState): HIGH — standard React pattern; no external library needed
- JSON library structure: MEDIUM — array-per-file format is an architectural choice (A2 in assumptions)
- Detail step question content: LOW — WIZ-04/07 don't specify exact sub-questions
- Package versions: HIGH — confirmed via npm view in this session

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (shadcn/ui moves fast; re-verify install commands if >30 days pass)
