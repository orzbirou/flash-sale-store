import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class CartTimerService {
  private readonly storeService = inject(StoreService);
  private readonly tick = signal(Date.now());
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly remainingByItemId = computed(() => {
    const now = this.tick();
    const map = new Map<string, number>();

    for (const item of this.storeService.cartItems()) {
      const expiresAt = new Date(item.expiresAt).getTime();
      map.set(item.id, Math.max(0, expiresAt - now));
    }

    return map;
  });

  constructor() {
    effect(() => {
      const hasItems = this.storeService.cartItems().length > 0;

      if (hasItems && this.intervalId === null) {
        this.intervalId = setInterval(() => {
          this.tick.set(Date.now());
        }, 1000);
      } else if (!hasItems && this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }
}
