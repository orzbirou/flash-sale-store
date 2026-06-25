import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stock-badge',
  standalone: true,
  templateUrl: './stock-badge.component.html',
  styleUrl: './stock-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockBadgeComponent {
  readonly stock = input.required<number>();
}
