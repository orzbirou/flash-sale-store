# Flash-Sale Store

A high-concurrency flash-sale e-commerce application built for limited-time product drops with strict inventory control.

## Overview

This project implements a full-stack flash-sale store where customers compete for limited stock during time-bound sales events. The architecture prioritizes correctness under concurrent load—preventing overselling—while remaining fast to develop and deploy.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express, TypeScript        |
| Frontend | Angular, TypeScript, Tailwind CSS   |
| Database | Prisma ORM, SQLite                  |

## Architecture Highlights

- **Backend**: Layered Express API (Routes → Controllers → Services) with global error handling and input validation.
- **Frontend**: Angular with functional `inject()` DI, Signals for state, and RxJS bridged via `toSignal()`.
- **Database**: Atomic stock decrements and transactional order creation to handle race conditions safely.

## Project Structure

```
flash-sale-store/
├── backend/          # Express API (coming soon)
├── frontend/         # Angular application (coming soon)
├── .cursorrules      # Architecture & coding standards
├── PROMPTS.md        # Development log
└── README.md
```

## Getting Started

Setup instructions will be added as the backend and frontend scaffolds are created.

## Development Standards

All contributors and AI agents must follow the rules defined in [`.cursorrules`](./.cursorrules). Key requirements include strict TypeScript, no `any`, race-safe database patterns, and documentation updates in [`PROMPTS.md`](./PROMPTS.md) after each major task.

## License

Private project — all rights reserved.
