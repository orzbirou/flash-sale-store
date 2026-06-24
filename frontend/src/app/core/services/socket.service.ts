import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { io, type Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import {
  STOCK_UPDATED_EVENT,
  isStockUpdatedPayload,
} from '../models/socket.model';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly storeService = inject(StoreService);
  private socket: Socket | null = null;

  readonly connected = signal(false);

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(environment.wsUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
    });

    this.socket.on(STOCK_UPDATED_EVENT, (payload: unknown) => {
      if (isStockUpdatedPayload(payload)) {
        this.storeService.patchProductStock(payload.productId, payload.stock);
      }
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.connected.set(false);
  }
}
