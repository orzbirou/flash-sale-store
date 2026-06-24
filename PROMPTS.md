# Flash-Sale Store — Development Log

This file records each major development step: the prompt that initiated it, what was built, and key architectural decisions. Update this file at the end of every major task.

---

## Step 0: Architectural Guidelines & Agent Alignment

### Prompt

> I am building a Flash-Sale store using Node.js (Express & TypeScript) for the backend and Angular for the frontend. We have a strict 48-hour deadline, so we will use Express and Prisma with SQLite for speed and ease of execution, while maintaining a strict enterprise architecture.
>
> Before we start building the actual code, I want to establish a strict set of global rules and Best Practices that you must adhere to throughout the entire development process.
>
> Please perform the following actions in AGENT MODE:
> 1. Create a `.cursorrules` file in the root directory. Inside, define strict architecture guidelines based on our tech stack:
>    - Global: Strict TypeScript ("strict": true, no "any"), production-grade standard.
>    - Frontend (Angular): Functional `inject()` pattern only, no constructor DI, lightweight state management with Angular Signals, RxJS handled via `toSignal()`, Tailwind CSS for layout.
>    - Backend (Express): Layered architecture (Routes -> Controllers -> Services), global error handling middleware, input validation.
>    - Database (Prisma + SQLite): Race-condition protection via atomic updates (WHERE stock > 0), database transactions for multi-step writes, explicit indexing.
>    - Documentation: Requirement for updating `PROMPTS.md` at the end of each major task.
>
> 2. Create an initial `PROMPTS.md` file in the root directory.
> 3. Document this exact step inside `PROMPTS.md` under "# Step 0: Architectural Guidelines & Agent Alignment". Include the prompt we just used and state that these rules were defined upfront to ensure a clean, high-quality, modern architecture.
>
> Please create these two files only for now. Do not generate the backend or frontend directories yet—we will handle that in the next step. Let me know once complete.

### What Was Done

- Created **`.cursorrules`** in the project root with mandatory, stack-specific guidelines covering:
  - **Global**: Strict TypeScript (`"strict": true`), no `any`, production-grade standards.
  - **Frontend (Angular)**: Functional `inject()` only (no constructor DI), Angular Signals for state, RxJS via `toSignal()`, Tailwind CSS for layout.
  - **Backend (Express)**: Strict layered architecture (Routes → Controllers → Services → Prisma), global error-handling middleware, schema-based input validation.
  - **Database (Prisma + SQLite)**: Atomic stock decrements (`WHERE stock > 0`), `prisma.$transaction()` for multi-step writes, explicit indexing in the schema.
  - **Documentation**: Requirement to append a new step to this file after every major task.
- Created **`PROMPTS.md`** (this file) as the living development log for the project.
- Added **repository safety configuration**:
  - **`.gitignore`** — excludes `node_modules/`, `dist/`, `build/`, `.env`, SQLite files (`*.db`, `*.db-journal`), and Cursor-specific folders (`.cursor/`), plus common Node/Angular/Prisma artifacts.
  - **`README.md`** — project overview, tech stack, architecture highlights, and pointer to `.cursorrules` for development standards.

### Rationale

These rules were defined **upfront**—before any application code—to ensure a clean, high-quality, modern architecture across the full 48-hour build. By locking in conventions now (strict typing, layered backend, signal-based frontend, race-safe database patterns), every subsequent step inherits the same standards and avoids costly rework during the flash-sale implementation.

### Key Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| TypeScript | `strict: true`, no `any` | Catch bugs at compile time; enterprise-grade safety |
| Angular DI | `inject()` only | Modern functional pattern; aligns with current Angular direction |
| State | Signals + `toSignal()` | Lightweight, no heavy state library overhead |
| Styling | Tailwind CSS | Rapid, consistent UI under deadline |
| Backend shape | Routes → Controllers → Services | Clear separation of concerns; testable layers |
| Stock safety | Atomic `updateMany` with `stock > 0` | Prevents overselling under concurrent load |
| DB engine | SQLite via Prisma | Fast local dev; sufficient for MVP flash-sale scope |

### Files Created

- `.cursorrules`
- `PROMPTS.md`
- `.gitignore`
- `README.md`

---

## Step 1: Requirements Ingestion & Monorepo Scaffolding

### Part 1 — Requirements Ingestion

#### Prompt

> Please perform Part 1 of Step 1 in AGENT MODE:
>
> 1. Create a `REQUIREMENTS.md` file in the root directory and ingest the exact raw task instructions inside.
> 2. Create a new section in `PROMPTS.md` titled "## Step 1: Requirements Ingestion & Monorepo Scaffolding" and document that the raw requirements were safely ingested into `REQUIREMENTS.md` to serve as our absolute truth for development.
>
> Please create and update these files only. Do not touch or create backend or frontend folders yet.

#### What Was Done

- Created **`REQUIREMENTS.md`** in the project root with the exact raw task instructions: flash-sale store scope, six functional requirements (pseudo-login, no oversell, stock decrement on add-to-cart, live remaining count, multi-item purchase, full frontend flow).
- The raw requirements were safely ingested into `REQUIREMENTS.md` to serve as our **absolute truth** for development—all subsequent design and implementation decisions must align with this document.

#### Rationale

Capturing requirements verbatim before scaffolding prevents scope drift during the 48-hour build. Critical constraints (atomic stock on cart add, live counts, no negative inventory) are now locked in a single reference file alongside architectural rules in `.cursorrules`.

#### Files Created / Updated

- `REQUIREMENTS.md` (created)
- `PROMPTS.md` (updated)

### Part 2 — Monorepo Scaffolding

#### Prompt

> Please perform Part 2 of Step 1:
>
> 1. Initialize the Frontend application via `npx @angular/cli new frontend` with `--standalone=true --style=css --routing=true`.
> 2. Initialize the Backend application: `/backend` directory, `npm init -y`, production deps (`express cors socket.io zod @prisma/client`), dev deps (`typescript @types/express @types/node @types/cors ts-node-dev prisma`), and `tsconfig.json` with `"strict": true`.
> 3. Configure root orchestration: root `npm init -y`, `concurrently` devDependency, and `start:backend` / `start:frontend` / `dev` scripts.
> 4. Update `PROMPTS.md` under Step 1 with Part 2 documentation.

#### What Was Done

- **Frontend**: Scaffolded `frontend/` with Angular CLI (`--standalone=true --style=css --routing=true --skip-git --defaults`). Used `@angular/cli@21` because `@latest` (v22) requires Node `>=22.22.3` and the environment runs Node `v22.22.0`. Generated standalone app with routing, CSS styling, and strict TypeScript (`strict: true` in `tsconfig.json`).
- **Backend**: Created `backend/`, ran `npm init -y`, installed production dependencies (`express`, `cors`, `socket.io`, `zod`, `@prisma/client`) and dev dependencies (`typescript`, `@types/express`, `@types/node`, `@types/cors`, `ts-node-dev`, `prisma`). Added `tsconfig.json` with `"strict": true`, Node-appropriate module resolution, and strict compiler flags (`noUncheckedIndexedAccess`, `noImplicitReturns`, etc.). Added `dev` and `build` scripts plus a placeholder `src/index.ts` entry point for root orchestration.
- **Root orchestration**: Initialized root `package.json`, installed `concurrently`, and added scripts:
  - `"start:backend": "npm run dev --prefix backend"`
  - `"start:frontend": "npm start --prefix frontend"`
  - `"dev": "concurrently \"npm run start:backend\" \"npm run start:frontend\""`

#### Directory Layout

```
flash-sale-store/
├── .cursorrules
├── .gitignore
├── package.json              # Root orchestration (concurrently)
├── package-lock.json
├── README.md
├── REQUIREMENTS.md
├── PROMPTS.md
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts          # Placeholder entry point
└── frontend/
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    ├── public/
    └── src/
        ├── app/              # Standalone components, routing
        ├── index.html
        ├── main.ts
        └── styles.css
```

#### Rationale

Monorepo scaffolding with root `concurrently` scripts enables single-command local development (`npm run dev`) while keeping frontend and backend as independent npm packages. Strict TypeScript on both sides enforces `.cursorrules` from day one.

#### Files Created / Updated

- `frontend/` (scaffolded via Angular CLI)
- `backend/` (initialized with dependencies and `tsconfig.json`)
- `backend/src/index.ts` (placeholder)
- `package.json` (root, with orchestration scripts)
- `PROMPTS.md` (updated)
