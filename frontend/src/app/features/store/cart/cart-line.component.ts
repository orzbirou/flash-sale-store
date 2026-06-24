import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CartItem } from '../../../core/models/cart-item.model';
import { CountdownDisplayComponent } from '../../../shared/components/countdown-display.component';

@Component({
  selector: 'app-cart-line',
  standalone: true,
  imports: [CountdownDisplayComponent],
  templateUrl: './cart-line.component.html',
  styleUrl: './cart-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartLineComponent {
  readonly item = input.required<CartItem>();
  readonly remainingMs = input.required<number>();

  readonly remove = output<string>();

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
