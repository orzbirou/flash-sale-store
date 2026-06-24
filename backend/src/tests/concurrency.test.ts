import { execSync } from 'node:child_process';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const backendRoot = path.resolve(__dirname, '../..');
const CONCURRENT_REQUESTS = 10;

describe('cart add concurrency', () => {
  const app = createApp();
  let productId: string;
  let userIds: string[];

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      cwd: backendRoot,
      env: process.env,
      stdio: 'pipe',
    });

    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    const product = await prisma.product.create({
      data: {
        name: 'Concurrency Test Widget',
        description: 'Single-unit flash-sale test SKU',
        priceCents: 999,
        stock: 1,
      },
    });
    productId = product.id;

    const users = await Promise.all(
      Array.from({ length: CONCURRENT_REQUESTS }, (_, index) =>
        prisma.user.create({ data: { name: `concurrency-user-${index}` } }),
      ),
    );
    userIds = users.map((user) => user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows exactly one reservation when many users add the last item in parallel', async () => {
    const responses = await Promise.all(
      userIds.map((userId) =>
        request(app)
          .post('/api/cart/items')
          .set('x-user-id', userId)
          .send({ productId, quantity: 1 }),
      ),
    );

    const successes = responses.filter((response) => response.status === 200);
    const conflicts = responses.filter((response) => response.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(CONCURRENT_REQUESTS - 1);

    for (const response of conflicts) {
      expect(response.body).toEqual({
        error: 'Insufficient stock or product unavailable',
      });
    }

    const finalProduct = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    expect(finalProduct.stock).toBe(0);
    expect(finalProduct.stock).toBeGreaterThanOrEqual(0);

    const cartItems = await prisma.cartItem.findMany({
      where: { productId },
    });
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]?.quantity).toBe(1);
  });
});
