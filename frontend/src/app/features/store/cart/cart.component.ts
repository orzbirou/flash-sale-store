import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CartTimerService } from '../../../core/services/cart-timer.service';
import { StoreService } from '../../../core/services/store.service';
import { CartLineComponent } from './cart-line.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartLineComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  readonly storeService = inject(StoreService);
  readonly cartTimer = inject(CartTimerService);
  readonly checkingOut = signal(false);
  private readonly syncedExpiredIds = new Set<string>();

  constructor() {
    effect(() => {
      const cartItems = this.storeService.cartItems();
      const remainingMap = this.cartTimer.remainingByItemId();

      for (const item of cartItems) {
        const remaining = remainingMap.get(item.id) ?? 0;
        if (remaining <= 0 && !this.syncedExpiredIds.has(item.id)) {
          this.syncedExpiredIds.add(item.id);
          void this.storeService.loadCart();
        }
      }

      for (const id of this.syncedExpiredIds) {
        if (!cartItems.some((item) => item.id === id)) {
          this.syncedExpiredIds.delete(id);
        }
      }
    });
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  async onRemove(productId: string): Promise<void> {
    await this.storeService.removeFromCart(productId);
  }

  async onCheckout(): Promise<void> {
    this.checkingOut.set(true);

    try {
      await this.storeService.checkout();
    } catch {
      // Error shown via storeService.error
    } finally {
      this.checkingOut.set(false);
    }
  }
}
