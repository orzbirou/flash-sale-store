import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StoreService } from '../../../core/services/store.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCatalogComponent {
  readonly storeService = inject(StoreService);
  readonly addingProductId = signal<string | null>(null);

  async onAddToCart(productId: string): Promise<void> {
    this.addingProductId.set(productId);

    try {
      await this.storeService.addToCart(productId, 1);
    } catch {
      // Error surfaced per-card via storeService.productErrors
    } finally {
      this.addingProductId.set(null);
    }
  }
}
