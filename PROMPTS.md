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

---

## Step 2: Database Design and Schema Configuration

### Prompt

> Implement Step 2: Prisma + SQLite schema (User, Product, CartItem, Order, OrderItem), indexes for flash-sale concurrency, seed script with 5 products, run migration and seed, document in PROMPTS.md.

### What Was Done

- Created **`backend/prisma/schema.prisma`** with five models (`User`, `Product`, `CartItem`, `Order`, `OrderItem`), `OrderStatus` enum, and explicit indexes for flash-sale hot paths (cart by `userId`, product browse by `name`, unique `userId+productId` on cart lines).
- Created **`backend/prisma.config.ts`** (Prisma 7 config with datasource URL and seed command).
- Created **`backend/.env.example`**; kept **`backend/.env`** (`DATABASE_URL="file:./prisma/dev.db"`).
- Created **`backend/prisma/seed.ts`** — idempotent seed of 5 limited-stock products.
- Created **`backend/prisma/tsconfig.json`** for seed TypeScript compilation.
- Added **`backend/src/lib/prisma.ts`** — shared Prisma client with `@prisma/adapter-better-sqlite3` (required in Prisma 7).
- Updated **`backend/package.json`** with `db:migrate`, `db:seed`, `db:reset` scripts.
- Installed: `ts-node`, `dotenv`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `@types/better-sqlite3`.
- Ran `prisma migrate dev --name init` and `prisma db seed` successfully.

### Design: Reservation-on-Cart Inventory

Stock decrements when items are **added to cart** (REQUIREMENTS.md #3), not at checkout:

- `Product.stock` = live remaining count (Socket.io broadcast in Step 3).
- Add to cart: atomic `updateMany` with `stock >= quantity`, then upsert `CartItem`.
- Checkout: snapshot `Order` + `OrderItem`, clear cart — no second stock decrement.
- Remove from cart: delete `CartItem`, increment `Product.stock`.

### Seed Products

| Product | Stock | Price |
|---------|-------|-------|
| Limited Edition Sneakers | 10 | $129.99 |
| Vintage Graphic Tee | 25 | $34.99 |
| Smart Watch Band | 50 | $19.99 |
| Wireless Earbuds | 5 | $79.99 |
| Insulated Water Bottle | 15 | $24.99 |

### Index Rationale

| Index | Purpose |
|-------|---------|
| `Product @@index([name])` | Browse listing |
| `CartItem @@unique([userId, productId])` | Safe upsert on add-to-cart |
| `CartItem @@index([userId])` | Hot path: load user's cart |
| `CartItem @@index([productId])` | Reverse lookup per product |
| `User @@index([name])` | Pseudo-login find-or-create |
| `Order @@index([userId])`, `@@index([status])`, `@@index([createdAt])` | Order history and filtering |
| `OrderItem @@index([orderId])`, `@@index([productId])` | Order line items |

No standalone `stock` index — atomic updates always filter by `id` first.

### Prisma 7 Note

Prisma 7 requires a driver adapter for SQLite. All `PrismaClient` usage must pass `{ adapter: new PrismaBetterSqlite3({ url }) }` — bare `new PrismaClient()` throws at runtime.

### Files Created / Updated

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260624144852_init/migration.sql`
- `backend/prisma/seed.ts`
- `backend/prisma/tsconfig.json`
- `backend/prisma.config.ts`
- `backend/.env.example`
- `backend/src/lib/prisma.ts`
- `backend/package.json`
- `backend/package-lock.json`
- `PROMPTS.md` (updated)

---

## Step 3: Backend Logic, Concurrency Services, and WebSockets

### Prompt

> Implement Step 3: layered Express API with atomic CartService, 5-minute CartCleanerService, transactional CheckoutService, Socket.io stock broadcasts, Zod validation, and global error handling.

### What Was Done

- **Schema migration:** Added `CartItem.expiresAt` + `@@index([expiresAt])` for 5-minute cart TTL and cleaner scans.
- **Infrastructure:** `AppError`, global `errorHandler`, Zod `validateBody`/`validateParams`, `asyncHandler`, `requireUser` (`x-user-id` header).
- **App bootstrap:** `app.ts` (Express + CORS + `/api` routes), `index.ts` (HTTP server + Socket.io + CartCleaner startup).
- **Services:**
  - `CartService` — atomic `addToCart` via `updateMany` + `count === 1` guard; `removeFromCart` restores stock in transaction.
  - `CheckoutService` — `$transaction` converts cart to `Order`/`OrderItem`, clears cart (no second stock decrement).
  - `CartCleanerService` — 60s interval; conditional delete on expired items + stock restore; race-safe vs checkout/re-add.
  - `StockBroadcastService` — emits `stock_updated` after add, remove, and expiry.
  - `AuthService`, `ProductService` — pseudo-login and catalog listing.
- **API routes:** `POST /api/auth/login`, `GET /api/products`, `GET/POST/DELETE /api/cart`, `POST /api/orders/checkout`.
- **Smoke test passed:** login → add to cart (stock 15→14) → checkout (order total 2499 cents).

### Atomic Add-to-Cart Pattern

```typescript
const decrementResult = await tx.product.updateMany({
  where: { id: productId, stock: { gte: quantity } },
  data: { stock: { decrement: quantity } },
});
if (decrementResult.count !== 1) throw new AppError(409, '...');
```

### WebSocket Events

| Event | Trigger |
|-------|---------|
| `stock_updated` | Add to cart, remove from cart, cart expiry |
| (none) | Checkout — stock already reserved |

Payload: `{ productId, stock }`

### Files Created / Updated

- `backend/prisma/schema.prisma` (expiresAt)
- `backend/prisma/migrations/20260624183649_add_cart_expires_at/`
- `backend/src/app.ts`, `backend/src/index.ts`
- `backend/src/lib/app-error.ts`, `socket.ts`, `cart-constants.ts`
- `backend/src/middlewares/` (error-handler, validate, require-user)
- `backend/src/validators/` (auth, cart)
- `backend/src/services/` (auth, product, cart, checkout, cart-cleaner, stock-broadcast)
- `backend/src/controllers/` (auth, product, cart, order)
- `backend/src/routes/` (auth, product, cart, order, index)
- `backend/.env.example` (PORT, CORS_ORIGIN)
- `PROMPTS.md` (updated)

---

## Step 4: Frontend Development (Angular + Tailwind CSS)

### Prompt

> Blueprint and implement the Angular + Tailwind frontend: retro-minimalist Baba Entertainment aesthetic, signal-based services, Socket.io live stock sync, anti-flicker product grid, server-synced cart countdown timers.

### What Was Done

- **Setup:** Tailwind CSS v4 (`@tailwindcss/postcss`), `socket.io-client`, IBM Plex fonts, `environment.ts`, `provideHttpClient()`.
- **Aesthetic:** Flat `arcade-panel` / `arcade-btn` utilities — 2px borders, uppercase labels, `font-mono tabular-nums` for stock/prices/timers. No gradients or neon glows.
- **Services (signals + `inject()`):**
  - `AuthService` — pseudo-login, `sessionStorage` persistence
  - `StoreService` — products, cart, checkout HTTP; `patchProductStock` for socket deltas
  - `SocketService` — `stock_updated` listener; connect/disconnect lifecycle
  - `CartTimerService` — single `setInterval` via `effect`; countdown from server `expiresAt`
- **Components:** `LoginComponent`, `StoreShellComponent`, `ProductCatalog` + `ProductCard`, `Cart` + `CartLine`, `StockBadge`, `CountdownDisplay`
- **Anti-flicker:** Fixed-width `stock-badge` (`min-w-[4.5rem]`, `tabular-nums`); in-place stock patches with `@for (track product.id)`
- **Routes:** `/login`, `/store` with `authGuard` / `guestGuard`
- **Build verified:** `ng build` succeeds

### Files Created / Updated

- `frontend/.postcssrc.json`, `frontend/src/styles.css`, `frontend/src/environments/environment.ts`
- `frontend/src/app/core/` (models, services, guards)
- `frontend/src/app/features/login/`, `frontend/src/app/features/store/`
- `frontend/src/app/shared/components/`
- `frontend/src/app/app.ts`, `app.routes.ts`, `app.config.ts`
- `frontend/package.json`, `frontend/src/index.html`
- `PROMPTS.md` (updated)

---

## Step 5: Backend Concurrency Integration Tests

### Prompt

> Add real, functional automated tests to the backend to scientifically prove race-condition and concurrency protection: Jest + supertest, seed product with stock=1, 10 parallel add-to-cart requests, assert 1 success and 9×409, final stock=0.

### What Was Done

- **Dependencies:** `jest`, `@types/jest`, `ts-jest`, `supertest`, `@types/supertest` in `backend/`.
- **Jest config:** `backend/jest.config.ts` — `ts-jest` preset, isolated test DB via `src/tests/setup.ts` (`file:./prisma/test-concurrency.db`).
- **Integration test:** `backend/src/tests/concurrency.test.ts` — migrates test DB, seeds 1-unit product + 10 users, fires `Promise.all` of 10 `POST /api/cart/items` with distinct `x-user-id` headers; asserts exactly 1×200, 9×409 with stock error message, `Product.stock === 0`, and a single cart reservation.
- **Script:** `"test": "jest --runInBand"` in `backend/package.json`.
- **Verified:** `npm test` passes locally (1 suite, 1 test).

### Key Decisions

- Uses `createApp()` + supertest (no HTTP server bind) to avoid port conflicts.
- Test endpoint is `POST /api/cart/items` (actual cart route; not `/api/cart/add`).
- `setup.ts` sets `DATABASE_URL` before Prisma loads so tests never touch `dev.db`.

### Files Created / Updated

- `backend/jest.config.ts`
- `backend/src/tests/setup.ts`
- `backend/src/tests/concurrency.test.ts`
- `backend/package.json`
- `PROMPTS.md` (updated)

---

## Step 6: Frontend ProductCard Signal Reactivity Tests

### Prompt

> Add a clean, functional frontend unit test for `ProductCardComponent` using Angular `TestBed` to verify signal-driven template updates: enabled "Add To Cart" when `stock > 0`, reactive disable + "Sold Out" when `stock` becomes 0.

### What Was Done

- **Spec:** `frontend/src/app/features/store/product-catalog/product-card.component.spec.ts` — uses `componentRef.setInput('product', …)` to drive the `input.required<Product>()` signal, then `detectChanges()` to assert DOM updates.
- **Assertions:** stock > 0 → button visible, enabled, label `Add To Cart`; stock updated to 0 → button `disabled`, label `Sold Out` (uppercase via `.arcade-btn`).
- **Test runner fix:** Removed invalid `styles` option from `angular.json` test target; wired `buildTarget: frontend:build:development` so global Tailwind styles load in tests.
- **Script:** `"test": "ng test --watch=false"` in `frontend/package.json`.
- **Verified:** `npm test` passes (2 files, 3 tests including existing `app.spec.ts`).

### Files Created / Updated

- `frontend/src/app/features/store/product-catalog/product-card.component.spec.ts`
- `frontend/angular.json`
- `frontend/package.json`
- `PROMPTS.md` (updated)

---

## Step 7: Architecture Documentation (`ARCHITECTURE.md`)

### Prompt

> Generate a comprehensive premium `ARCHITECTURE.md` covering monorepo layout, concurrency protection, real-time inventory, cart TTL lifecycle, automated testing proof, and production scalability horizon.

### What Was Done

- **Created** root `ARCHITECTURE.md` with six sections mapping 1:1 to the completed implementation: Express/Angular monorepo, Prisma 7 + SQLite native adapter, atomic `updateMany` stock guards, Socket.io `stock_updated`, cart lease cleaner + `CartTimerService`, Jest concurrency + Angular signal unit tests, and Redis/debounce scalability notes.

### Files Created / Updated

- `ARCHITECTURE.md`
- `PROMPTS.md` (updated)

