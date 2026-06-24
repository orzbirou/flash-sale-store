/** Isolated SQLite file for integration tests — must run before app/prisma imports. */
process.env['DATABASE_URL'] = 'file:./prisma/test-concurrency.db';
