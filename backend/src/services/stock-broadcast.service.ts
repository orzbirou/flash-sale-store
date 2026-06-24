import type { Server } from 'socket.io';

export interface StockUpdatedPayload {
  productId: string;
  stock: number;
}

export const STOCK_UPDATED_EVENT = 'stock_updated';

class StockBroadcastService {
  private io: Server | null = null;

  init(io: Server): void {
    this.io = io;
  }

  emitStockUpdated(productId: string, stock: number): void {
    if (!this.io) {
      return;
    }

    const payload: StockUpdatedPayload = { productId, stock };
    this.io.emit(STOCK_UPDATED_EVENT, payload);
  }
}

export const stockBroadcastService = new StockBroadcastService();
