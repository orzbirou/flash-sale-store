import { execSync } from 'node:child_process';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const backendRoot = path.resolve(__dirname, '../..');
const INITIAL_STOCK = 5;
const PRICE_CENTS = 2_499;

describe('Successful Full Purchase Flow', () => {
  const app = createApp();
  let userId: string;
  let productId: string;

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

    const user = await prisma.user.create({
      data: { name: 'purchase-flow-user' },
    });
    userId = user.id;

    const product = await prisma.product.create({
      data: {
        name: 'Full Flow Test Widget',
        description: 'Integration test SKU for end-to-end purchase',
        priceCents: PRICE_CENTS,
        stock: INITIAL_STOCK,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('completes browse, add-to-cart, and checkout lifecycle', async () => {
    const productsResponse = await request(app).get('/api/products');

    expect(productsResponse.status).toBe(200);

    const listedProduct = (
      productsResponse.body.data as Array<{ id: string; stock: number }>
    ).find((product) => product.id === productId);

    expect(listedProduct).toBeDefined();
    expect(listedProduct?.stock).toBe(INITIAL_STOCK);

    const addResponse = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', userId)
      .send({ productId, quantity: 1 });

    expect(addResponse.status).toBe(200);
    expect(addResponse.body.data.stock).toBe(INITIAL_STOCK - 1);

    const productAfterAdd = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    expect(productAfterAdd.stock).toBe(INITIAL_STOCK - 1);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId, productId },
    });
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]?.quantity).toBe(1);

    const cartResponse = await request(app)
      .get('/api/cart')
      .set('x-user-id', userId);

    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.data).toHaveLength(1);
    expect(cartResponse.body.data[0].productId).toBe(productId);

    const checkoutResponse = await request(app)
      .post('/api/orders/checkout')
      .set('x-user-id', userId)
      .send({});

    expect(checkoutResponse.status).toBe(201);

    const order = checkoutResponse.body.data;
    expect(order.userId).toBe(userId);
    expect(order.totalCents).toBe(PRICE_CENTS);
    expect(order.orderItems).toHaveLength(1);
    expect(order.orderItems[0].productId).toBe(productId);
    expect(order.orderItems[0].quantity).toBe(1);
    expect(order.orderItems[0].unitPriceCents).toBe(PRICE_CENTS);

    const cartAfterCheckout = await prisma.cartItem.findMany({
      where: { userId },
    });
    expect(cartAfterCheckout).toHaveLength(0);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
    });
    expect(orders).toHaveLength(1);
    expect(orders[0]?.orderItems).toHaveLength(1);
  });
});
