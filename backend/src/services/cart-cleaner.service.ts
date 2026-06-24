import { CART_CLEANER_INTERVAL_MS } from '../lib/cart-constants';
import { prisma } from '../lib/prisma';
import { stockBroadcastService } from './stock-broadcast.service';

export class CartCleanerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.intervalId) {
      return;
    }

    void this.cleanExpiredItems();

    this.intervalId = setInterval(() => {
      void this.cleanExpiredItems();
    }, CART_CLEANER_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async cleanExpiredItems(): Promise<void> {
    const now = new Date();

    const expiredItems = await prisma.cartItem.findMany({
      where: { expiresAt: { lt: now } },
      select: { id: true, productId: true, quantity: true },
    });

    for (const item of expiredItems) {
      const product = await prisma.$transaction(async (tx) => {
        const removed = await tx.cartItem.deleteMany({
          where: {
            id: item.id,
            expiresAt: { lt: now },
          },
        });

        if (removed.count !== 1) {
          return null;
        }

        return tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      });

      if (product) {
        stockBroadcastService.emitStockUpdated(product.id, product.stock);
      }
    }
  }
}

export const cartCleanerService = new CartCleanerService();
