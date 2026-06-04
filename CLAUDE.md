<!-- GSD:project-start source:PROJECT.md -->
## Project

**QA Test Constructor**

Standalone веб-додаток для QA-команди: покроковий wizard, який через серію фіксованих питань збирає параметри проекту та генерує готовий набір тест кейсів. Логіка детермінована — жодного AI, лише матриця "відповідь → кейси". Першочергово розгортається локально та на Vercel, в майбутньому стане окремою вкладкою у платформі Feedboon.

**Core Value:** QA-спеціаліст заповнює wizard за 2 хвилини і отримує готову таблицю тест кейсів у форматі Markdown — без написання вручну.

### Constraints

- **Tech Stack**: Next.js + Tailwind CSS — відповідає стеку Feedboon
- **Storage**: тільки статика, JSON-файли у проекті — бекенд поза скоупом
- **Language**: UI тільки українською
- **Design**: стиль Feedboon (референс очікується від замовника перед UI-фазою)
- **Deployment**: Vercel-compatible (static export або Next.js deploy)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
