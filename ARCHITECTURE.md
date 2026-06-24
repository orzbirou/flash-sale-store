# Flash-Sale Store — System Architecture

This document describes the production architecture of the Flash-Sale Store: a high-concurrency e-commerce system designed to sell limited inventory during time-bound drops without overselling, layout jitter, or stale UI state.

---

## 1. High-Level Architecture Overview

The repository is a **modern monorepo** with two independently runnable applications orchestrated from the workspace root.

```
flash-sale-store/
├── backend/                 # Node.js API (Express + TypeScript)
│   ├── prisma/              # Schema, migrations, seed, SQLite files
│   └── src/
│       ├── routes/          # HTTP route wiring only
│       ├── controllers/     # Request parsing + response mapping
│       ├── services/        # Business logic + transactions
│       ├── middlewares/     # Auth, validation, error handling
│       ├── lib/             # Prisma client, Socket.io, shared utilities
│       └── tests/           # Integration tests (Jest + supertest)
├── frontend/                # Standalone Angular 21 SPA
│   └── src/app/
│       ├── core/            # Services, guards, models
│       ├── features/        # Login, store shell, catalog, cart
│       └── shared/          # Presentational components (badges, timers)
├── .cursorrules             # Engineering standards
├── PROMPTS.md               # Development log
├── REQUIREMENTS.md          # Product requirements
└── ARCHITECTURE.md          # This document
```

### Backend — Express & TypeScript

The backend is a **layered Express 5 API** with strict separation of concerns:

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP method + path mapping, middleware wiring |
| **Controllers** | Parse request, invoke services, set status/body |
| **Services** | Business rules, Prisma transactions, validation orchestration |
| **Prisma** | Data access only — no HTTP or domain logic |

Request flow:

```
HTTP Request → Routes → Controllers → Services → Prisma → SQLite
                              ↓
                    Global Error Handler (AppError → status JSON)
```

Key capabilities:

- REST endpoints under `/api` (auth, products, cart, checkout)
- Pseudo-login via `POST /api/auth/login` and session identity via `x-user-id` header
- Zod schema validation at the controller/route boundary
- Socket.io attached to the same HTTP server for real-time stock broadcasts
- Background cart lease cleaner started at boot

### Frontend — Standalone Angular 21

The frontend is a **standalone-component Angular 21 SPA** with no NgRx or heavy state libraries.

| Concern | Approach |
|---------|----------|
| **DI** | Functional `inject()` only — no constructor injection |
| **State** | Angular Signals (`signal`, `computed`, `effect`) |
| **HTTP** | `HttpClient` + `firstValueFrom()` in services |
| **Change detection** | `ChangeDetectionStrategy.OnPush` on every component |
| **Styling** | Tailwind CSS v3 utility classes + shared arcade design tokens |
| **Real-time** | `socket.io-client` bridged into signal state via `StoreService.patchProductStock()` |

Routes: `/login` (guest) → `/store` (authenticated shell with catalog + cart).

### Database — Prisma 7 + SQLite + Native Driver

The persistence layer uses **Prisma 7 ORM** with **SQLite** and the **`@prisma/adapter-better-sqlite3`** native driver adapter. This combination was chosen deliberately:

- **Zero external infrastructure** — reviewers can clone, migrate, seed, and run without Docker, Postgres, or Redis.
- **Native performance** — `better-sqlite3` provides synchronous, embedded SQLite access through Prisma's driver adapter API.
- **Typed data access** — generated `@prisma/client` types flow through every service layer.

Prisma client initialization (`backend/src/lib/prisma.ts`):

```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
export const prisma = new PrismaClient({ adapter });
```

Default connection: `DATABASE_URL="file:./prisma/dev.db"`. Migrations are managed exclusively through **Prisma Migrate** — never hand-edited in production workflows.

Core entities: `User`, `Product`, `CartItem` (with lease timestamp), `Order`, `OrderItem`.

---

## 2. Concurrency Control & Race-Condition Protection

Flash-sale traffic creates a classic **lost-update** problem: many users attempt to buy the last unit simultaneously. This system solves it at the **database query level**, not in application memory.

### Reservation-on-Cart (Not Checkout)

Stock is **reserved and decremented at the exact millisecond an item is added to the cart**, not at checkout. This design:

- Prevents users from holding phantom availability in their browser while stock is already gone
- Makes "Add to Cart" the atomic contention point — matching real flash-sale UX expectations
- Ensures checkout only converts **pre-reserved** inventory into a formal order

### Atomic Stock Decrement via `updateMany`

Inside `CartService.addToCart`, stock mutation runs inside a **Prisma interactive transaction**:

```typescript
const decrementResult = await tx.product.updateMany({
  where: {
    id: productId,
    stock: { gte: quantity },
  },
  data: {
    stock: { decrement: quantity },
  },
});

if (decrementResult.count !== 1) {
  throw new AppError(409, 'Insufficient stock or product unavailable');
}
```

This translates to SQL equivalent to:

```sql
UPDATE Product
SET stock = stock - :quantity
WHERE id = :productId AND stock >= :quantity;
```

#### Why this is bulletproof

| Anti-pattern | Our approach |
|--------------|--------------|
| **Read-modify-write** — read stock in app memory, subtract 1, write back | Single conditional `UPDATE` executed atomically by SQLite |
| **Optimistic locking with version columns** — retry loops under burst load | Zero retries; winner-takes-all at the row level |
| **Application-level mutexes** — don't scale across processes | Database engine serializes conflicting writes on the row |

When two concurrent requests race for the last unit:

1. Both enter the transaction
2. SQLite serializes the `UPDATE` statements
3. **Exactly one** `updateMany` returns `count === 1`
4. The other returns `count === 0` → immediately thrown as **`AppError(409)`**
5. The global error handler maps this to **HTTP 409 Conflict** with a clear JSON body: `{ "error": "Insufficient stock or product unavailable" }`

Stock **never goes negative** because the `WHERE stock >= quantity` guard prevents the decrement from applying when inventory is insufficient.

The same transaction also upserts the `CartItem` row (with a fresh `expiresAt` lease), so reservation and inventory deduction are **all-or-nothing**.

### Checkout Without Double Deduction

`CheckoutService.checkout` operates inside a single **`prisma.$transaction`** block:

1. Load the user's cart items (stock already decremented at add-to-cart time)
2. Compute `totalCents` from cart line quantities × unit prices
3. Create an `Order` + `OrderItem` records
4. Delete all cart items for the user

**No second stock decrement occurs at checkout.** The pipeline converts pre-reserved cart inventory into an official order record. If checkout fails mid-transaction, Prisma rolls back the order creation — cart items (and their reservations) remain intact.

### Proof: Backend Concurrency Integration Test

`backend/src/tests/concurrency.test.ts` fires **10 parallel** `POST /api/cart/items` requests (via `Promise.all()` + supertest) against a product seeded with **stock = 1**. The test asserts:

- Exactly **1** response returns HTTP **200**
- Exactly **9** responses return HTTP **409**
- Final `Product.stock === 0`
- Exactly **1** `CartItem` reservation exists

Run: `cd backend && npm test`

---

## 3. Real-Time Inventory & Visual Stability

### Socket.io Push Model

When stock changes — add to cart, remove from cart, or lease expiry — the backend emits a lightweight snapshot:

| Event | Payload |
|-------|---------|
| `stock_updated` | `{ productId: string, stock: number }` |

`StockBroadcastService` broadcasts via `io.emit()` to all connected clients. The frontend `SocketService` listens, validates the payload shape, and calls `StoreService.patchProductStock()` to update the in-memory product list signal **in place** — no full catalog refetch required.

Socket.io is attached to the same Node HTTP server (`backend/src/index.ts`) and initialized alongside the cart cleaner at boot.

### Client-Side Visual Stability

Rapid stock updates during a flash drop can cause **layout flicker** — badges resize, prices shift, buttons jump. This frontend applies deliberate stability techniques:

| Technique | Implementation |
|-----------|----------------|
| **Fixed-width stock badge** | `.stock-badge` uses `min-w-[4.5rem]` so digit changes (e.g., `12` → `3` → `0`) don't collapse card width |
| **Tabular numerals** | `font-mono tabular-nums` on stock counts, prices, and countdown timers — glyphs occupy equal width |
| **Stable card geometry** | Product cards use `min-h-[320px]`, fixed art area (`h-36`), and `line-clamp` on name/description |
| **In-place signal patches** | `@for (track product.id)` + `patchProductStock()` updates only the affected product's `stock` field — no list re-render churn |
| **OnPush change detection** | All components use `ChangeDetectionStrategy.OnPush`, re-rendering only when signal inputs or dependencies change |

Low-stock visual state (`stock > 0 && stock <= 5`) uses a fixed-position badge (`absolute right-2 top-2`) so it doesn't reflow surrounding content.

---

## 4. Cart Hold/Lease Lifecycle (TTL)

### Server-Side Lease Timestamps

Every `CartItem` row carries an explicit **`expiresAt`** timestamp (indexed in the schema). When a user adds an item:

- `expiresAt = now + CART_TTL_MS` (currently **5 minutes**)
- Re-adding the same product refreshes the lease (`expiresAt` reset + quantity increment)

This models inventory as a **temporary hold** — not a permanent sale until checkout completes.

### Background Cart Cleaner

`CartCleanerService` runs on a **60-second interval** (`CART_CLEANER_INTERVAL_MS`):

1. Query all `CartItem` rows where `expiresAt < now`
2. For each expired item, run an atomic transaction:
   - Delete the cart row (with a conditional `deleteMany` guard to avoid double-processing)
   - Increment `Product.stock` by the released quantity
3. Emit `stock_updated` via Socket.io for each restored product

This ensures abandoned carts **automatically release inventory** back to the available pool without manual intervention.

### Client-Side Unified Timer — `CartTimerService`

Rather than spawning a `setInterval` per cart line (which scales poorly and drifts), the frontend uses a **single central tick loop**:

- An `effect()` watches `StoreService.cartItems()`
- When the cart is non-empty, one `setInterval` fires every **1 second**, updating a `tick` signal
- A `computed()` map derives `remainingByItemId` from each item's server-provided `expiresAt` minus `Date.now()`

This ties UI countdowns to **exact database-driven timestamps**, not client-side guesswork. When a timer hits zero, `CartComponent`'s effect triggers a cart reload to sync with server-side expiry.

Display: `CountdownDisplayComponent` formats remaining time as `MM:SS` with urgent styling below 60 seconds.

---

## 5. Automated Testing Strategy (Our Proof)

The system ships with automated tests that verify the two most critical correctness properties: **no overselling under concurrency** and **reactive sold-out UI**.

### Backend — Concurrency Integration Test

| Property | Detail |
|----------|--------|
| **Framework** | Jest + ts-jest + supertest |
| **File** | `backend/src/tests/concurrency.test.ts` |
| **Isolation** | Dedicated SQLite file via `src/tests/setup.ts` (`test-concurrency.db`) |
| **Scenario** | 10 users, 1 product with `stock = 1`, simultaneous `POST /api/cart/items` |
| **Assertions** | 1× HTTP 200, 9× HTTP 409, final stock = 0, single cart reservation |

Run: `cd backend && npm test` (`jest --runInBand`)

### Frontend — Signal Reactivity Unit Test

| Property | Detail |
|----------|--------|
| **Framework** | Angular Vitest runner (`@angular/build:unit-test`) |
| **File** | `frontend/src/app/features/store/product-catalog/product-card.component.spec.ts` |
| **Scenario 1** | `stock > 0` → "Add To Cart" button enabled and visible |
| **Scenario 2** | Update product input to `stock: 0` → signal-driven template refresh → button `disabled`, label "Sold Out" |

Tests use `componentRef.setInput('product', …)` to drive signal inputs and `fixture.detectChanges()` to assert DOM state under **OnPush** change detection.

Run: `cd frontend && npm test` (`ng test --watch=false`)

Together, these tests form a **scientific proof layer**: the backend test proves atomic inventory under burst concurrency; the frontend test proves the UI immediately reflects zero stock through Angular Signals.

---

## 6. Production Scalability Horizon

The current SQLite + in-process architecture is optimized for **correctness, reviewer portability, and rapid development**. For peak global flash-sale volume, the following professional enhancements would be the natural evolution path:

### Redis for Hot Inventory & Ephemeral Cart State

| Concern | Enhancement |
|---------|-------------|
| **Hot SKU contention** | Move atomic decrement logic to **Redis** using `DECR` or **Lua scripts** that check-and-decrement in a single atomic server-side operation |
| **Cart leases** | Store cart holds as **Redis keys with TTL** (`SET key value EX 300`) — native expiry replaces polling cleaner intervals |
| **Cross-region** | Redis Cluster or ElastiCache provides shared state across multiple API instances; SQLite becomes the system-of-record for completed orders only |

The existing `updateMany` + conditional guard pattern maps directly to Redis Lua:

```lua
-- Conceptual equivalent
if tonumber(redis.call('GET', 'stock:' .. productId)) >= quantity then
  return redis.call('DECRBY', 'stock:' .. productId, quantity)
else
  return -1  -- maps to HTTP 409
end
```

### WebSocket Stream Debouncing

During extreme bursts (thousands of `stock_updated` events per second), broadcasting every individual decrement can overwhelm browser rendering pipelines.

| Technique | Benefit |
|-----------|---------|
| **Server-side debounce/coalesce** | Buffer updates per `productId` for 50–100ms; emit only the latest stock snapshot |
| **Delta throttling** | Suppress broadcasts when stock change is zero or below a visibility threshold |
| **Room-based fan-out** | Scope Socket.io rooms to active catalog viewers instead of global `io.emit()` |

The frontend's fixed-width badges and `tabular-nums` typography are already designed to absorb rapid updates gracefully — debouncing would reduce unnecessary signal churn at the source.

### Horizontal API Scaling

- Replace SQLite with **PostgreSQL** (or keep SQLite for dev, Postgres for prod)
- Run multiple Express instances behind a load balancer
- Use Redis as the shared coordination layer for stock + cart leases
- Keep the layered Routes → Controllers → Services architecture unchanged — only the service implementations swap Prisma/SQLite calls for Redis operations

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` (root) | Start backend + frontend concurrently |
| `cd backend && npm run db:migrate` | Apply Prisma migrations |
| `cd backend && npm run db:seed` | Seed sample products |
| `cd backend && npm test` | Run concurrency integration test |
| `cd frontend && npm test` | Run Angular unit tests |
| `cd frontend && npm run build` | Production frontend build |

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Pseudo-login, returns user |
| `/api/products` | GET | Product catalog |
| `/api/cart/items` | POST | Add to cart (atomic stock reservation) |
| `/api/cart/items/:productId` | DELETE | Remove from cart (stock restore) |
| `/api/orders/checkout` | POST | Convert cart → order (no re-decrement) |

| Constant | Value | Meaning |
|----------|-------|---------|
| `CART_TTL_MS` | 300,000 (5 min) | Cart lease duration |
| `CART_CLEANER_INTERVAL_MS` | 60,000 (1 min) | Expired cart sweep interval |

---

*This architecture document reflects the completed implementation as of the final project deliverable. For the step-by-step development history, see [`PROMPTS.md`](./PROMPTS.md). For coding standards enforced during development, see [`.cursorrules`](./.cursorrules).*
