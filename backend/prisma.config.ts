/// <reference types="node" />
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --project prisma/tsconfig.json prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db',
  },
});
