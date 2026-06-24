export interface StockUpdatedPayload {
  productId: string;
  stock: number;
}

export const STOCK_UPDATED_EVENT = 'stock_updated';

export function isStockUpdatedPayload(value: unknown): value is StockUpdatedPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record['productId'] === 'string' && typeof record['stock'] === 'number';
}
