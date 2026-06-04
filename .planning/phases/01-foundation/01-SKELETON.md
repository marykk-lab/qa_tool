# Walking Skeleton: QA Test Constructor — Phase 1

## What This Proves

The thinnest possible end-to-end slice of the QA Test Constructor: a Next.js + Tailwind
app that **reads a real test-case JSON file from `/data/test-cases/` at runtime, renders it
on a page using Tailwind-styled markup, responds to a real user interaction, and is reachable
via a live Vercel URL.**

Every architectural decision the later phases depend on is exercised here once, for real:
- The framework (Next.js App Router + TypeScript) boots and serves a page.
- The styling layer (Tailwind) compiles and applies classes to rendered DOM.
- The data layer (`/data/test-cases/*.json` with the agreed 6-field schema) is read by app code
  and surfaced in the UI — not mocked, not hardcoded.
- The deployment pipeline (Vercel) builds and serves the app at a public URL.

If this skeleton works, Phase 2 (wizard) and Phase 3 (generation/export) are pure feature
additions on a proven spine — no renegotiation of stack, schema location, or deploy path.

## Skeleton Deliverable

A deployed page (local at `http://localhost:3000` and live at a Vercel URL) that:
1. Loads at least one sample test case from `data/test-cases/sample.json`.
2. Displays that test case's fields (ID, Назва, Передумови, Кроки, Очікуваний результат, Пріоритет)
   in a Tailwind-styled card/table.
3. Has one working interactive control (a "Показати деталі" toggle button) that changes what is
   shown — proving client interactivity works end to end.

## End-to-End Flow

1. **Build/boot:** `npm run dev` (or Vercel build) compiles the Next.js app and Tailwind CSS.
2. **Data read:** The page (`src/app/page.tsx`) imports/reads `data/test-cases/sample.json` through
   the typed loader in `src/lib/test-cases.ts`, validated against the `TestCase` type in
   `src/lib/types.ts`.
3. **Render:** The loaded `TestCase` is rendered into a Tailwind-styled component showing all six
   schema fields with Ukrainian labels.
4. **User interaction:** User clicks "Показати деталі" → the steps (Кроки) section toggles open/closed
   via React state.
5. **Deploy:** The same code is deployed to Vercel; the live URL serves the identical rendered page.

## Technical Scaffolding

Files created/initialized:
- `package.json`, `next.config.*`, `tsconfig.json`, `tailwind.config.*`, `postcss.config.*`,
  `.gitignore`, `next-env.d.ts` — Next.js + TypeScript + Tailwind scaffold.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` — App Router entry + Tailwind directives.
- `src/lib/types.ts` — `TestCase` TypeScript type (the schema contract for all later phases).
- `src/lib/test-cases.ts` — typed loader that reads JSON from `data/test-cases/`.
- `src/components/TestCaseCard.tsx` — Tailwind-styled, interactive rendering of one test case.
- `data/test-cases/sample.json` — one valid sample test case (agreed schema, e.g. ID `TC-CAT-001`).
- `data/test-cases/README.md` — documents the JSON schema and ID-prefix convention for Phase 2.
- `vercel.json` (if needed) + Vercel project link — deployment config.

Frameworks/tooling decisions (recorded for downstream phases):
- **Next.js App Router** (not Pages Router) — modern Feedboon-aligned default.
- **TypeScript** — the `TestCase` type is the single source of truth for the schema.
- **Tailwind CSS** — utility-first styling; Feedboon theme tokens layered in Phase 3.
- **Data location:** `/data/test-cases/` at repo root (NOT under `src/`), so QA can edit JSON
  without touching app code — matches GEN-01.
- **Rendering mode:** Next.js deploy on Vercel (not static `output: export`) is the default path,
  keeping server/client component flexibility for the wizard; static export remains a fallback
  option if the client later requires a pure-static artifact.

## Acceptance

Run and observe:
1. `npm install` completes without errors.
2. `npm run dev` starts on port 3000 with no compile errors; visiting `http://localhost:3000`
   shows the sample test case with its Ukrainian field labels.
3. Tailwind is working: the rendered card has visible Tailwind-applied styling (e.g. a colored
   priority badge); inspecting the element shows Tailwind utility classes in the DOM.
4. Clicking "Показати деталі" toggles the Кроки (steps) section visibility.
5. `data/test-cases/sample.json` exists and contains the keys `ID`, `Назва`, `Передумови`, `Кроки`,
   `Очікуваний результат`, `Пріоритет`.
6. `npm run build` succeeds (Vercel-buildable).
7. The Vercel deployment succeeds and the live URL renders the same page (human-verified).
