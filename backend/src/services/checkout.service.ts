import { AppError } from '../lib/app-error';
import { prisma } from '../lib/prisma';
import type { OrderWithItems } from './cart.service';

export class CheckoutService {
  async checkout(userId: string): Promise<OrderWithItems> {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      const cartItems = await tx.cartItem.findMany({
        where: {
          userId,
          expiresAt: { gt: now },
        },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        const staleCount = await tx.cartItem.count({ where: { userId } });

        if (staleCount > 0) {
          throw new AppError(410, 'Cart reservation has expired.');
        }

        throw new AppError(400, 'Cart is empty');
      }

      const totalCents = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.product.priceCents,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.product.priceCents,
            })),
          },
        },
        include: { orderItems: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }
}

export const checkoutService = new CheckoutService();
