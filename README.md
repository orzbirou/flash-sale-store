# Flash-Sale Store

A full-stack flash-sale store for limited-inventory product drops. The system reserves stock at add-to-cart time, broadcasts live counts over WebSockets, and enforces atomic inventory guards under concurrent load.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js, Express 5, TypeScript, Prisma 7, Socket.io |
| Frontend | Angular 21 (standalone), Signals, Tailwind CSS v3 |
| Database | SQLite via `@prisma/adapter-better-sqlite3` |

## Prerequisites

- **Node.js** `>= 20.x` (LTS recommended; tested on Node 20 and 22)
- **npm** `>= 10.x`

## Project Structure

```
flash-sale-store/
├── backend/           # Express API, Prisma schema, Jest integration tests
├── frontend/          # Angular SPA, Vitest unit tests
├── .cursorrules       # Engineering standards
├── REQUIREMENTS.md    # Product requirements
├── ARCHITECTURE.md    # System design reference
├── PROMPTS.md         # Development log
└── package.json       # Root orchestration (concurrent dev)
```

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure the backend environment

Copy the example env file and adjust if needed:

```bash
cp backend/.env.example backend/.env
```

Default `backend/.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
CORS_ORIGIN="http://localhost:4200"
```

### 3. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

This applies all Prisma migrations and creates `backend/prisma/dev.db`.

### 4. Seed sample products

```bash
npm run db:seed
```

Seeds five flash-sale SKUs with varied stock levels.

### 5. Start development servers

From the repository root:

```bash
npm run dev
```

| Service  | URL |
|----------|-----|
| Backend  | http://localhost:3000 |
| Frontend | http://localhost:4200 |

The root `dev` script uses `concurrently` to run both servers. Open the frontend URL, enter a player name on the login screen, and browse the store.

## Testing

From the repository root, run the unified test suite (backend Jest integration tests, then frontend Vitest unit tests):

```bash
npm test
```

This executes:

- **Backend** — concurrency integration test (10 parallel add-to-cart requests against a single-stock product) and full purchase-flow integration test (browse → add to cart → checkout)
- **Frontend** — `ProductCardComponent` signal reactivity tests under `ChangeDetectionStrategy.OnPush`

## Production Build

```bash
npm run build --prefix backend
npm run build --prefix frontend
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Pseudo-login with `{ "name": "..." }` |
| `/api/products` | GET | Product catalog |
| `/api/cart/items` | POST | Add to cart (atomic stock reservation) |
| `/api/cart/items/:productId` | DELETE | Remove from cart |
| `/api/orders/checkout` | POST | Checkout pre-reserved cart items |

Authenticated cart and checkout routes require the `x-user-id` header returned from login.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design, concurrency model, and scalability notes
- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — functional requirements
- [`.cursorrules`](./.cursorrules) — coding standards for contributors and agents

## License

Private project — all rights reserved.
