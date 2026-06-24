import type { Product } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ProductService {
  async list(): Promise<Product[]> {
    return prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const productService = new ProductService();
