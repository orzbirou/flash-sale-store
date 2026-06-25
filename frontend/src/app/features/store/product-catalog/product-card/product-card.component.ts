import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { Product } from '../../../../core/models/product.model';
import { StockBadgeComponent } from '../../../../shared/components/stock-badge/stock-badge.component';

export type ProductIconType = 'sneakers' | 'tee' | 'watch' | 'earbuds' | 'bottle' | 'default';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [StockBadgeComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly isAdding = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly addToCart = output<string>();

  readonly iconType = computed((): ProductIconType => {
    const name = this.product().name.toLowerCase();

    if (name.includes('sneaker') || name.includes('shoe')) {
      return 'sneakers';
    }
    if (name.includes('tee') || name.includes('shirt') || name.includes('graphic')) {
      return 'tee';
    }
    if (name.includes('watch') || name.includes('band')) {
      return 'watch';
    }
    if (name.includes('earbud') || name.includes('headphone') || name.includes('wireless')) {
      return 'earbuds';
    }
    if (name.includes('bottle') || name.includes('water')) {
      return 'bottle';
    }

    return 'default';
  });

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
