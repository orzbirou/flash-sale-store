import type { Product } from './product.model';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  createdAt: string;
  orderItems: OrderItem[];
}
