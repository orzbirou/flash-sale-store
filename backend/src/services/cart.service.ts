import type { CartItem, Order, OrderItem, Product } from '@prisma/client';
import { AppError } from '../lib/app-error';
import { cartExpiresAt } from '../lib/cart-constants';
import { prisma } from '../lib/prisma';
import { stockBroadcastService } from './stock-broadcast.service';

export type CartItemWithProduct = CartItem & { product: Product };

export class CartService {
  async getCart(userId: string): Promise<CartItemWithProduct[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Product> {
    const product = await prisma.$transaction(async (tx) => {
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

      const expiresAt = cartExpiresAt();

      await tx.cartItem.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        create: {
          userId,
          productId,
          quantity,
          expiresAt,
        },
        update: {
          quantity: { increment: quantity },
          expiresAt,
        },
      });

      return tx.product.findUniqueOrThrow({ where: { id: productId } });
    });

    stockBroadcastService.emitStockUpdated(product.id, product.stock);
    return product;
  }

  async removeFromCart(userId: string, productId: string): Promise<Product> {
    const product = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: { userId, productId },
        },
      });

      if (!cartItem) {
        throw new AppError(404, 'Cart item not found');
      }

      const deleted = await tx.cartItem.deleteMany({
        where: {
          id: cartItem.id,
          userId,
          productId,
        },
      });

      if (deleted.count !== 1) {
        throw new AppError(404, 'Cart item not found');
      }

      return tx.product.update({
        where: { id: productId },
        data: { stock: { increment: cartItem.quantity } },
      });
    });

    stockBroadcastService.emitStockUpdated(product.id, product.stock);
    return product;
  }
}

export const cartService = new CartService();

export type OrderWithItems = Order & { orderItems: OrderItem[] };
