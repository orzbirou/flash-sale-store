import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  templateUrl: './countdown-display.component.html',
  styleUrl: './countdown-display.component.scss',
})
export class CountdownDisplayComponent {
  readonly remainingMs = input.required<number>();

  readonly isExpired = computed(() => this.remainingMs() <= 0);
  readonly isUrgent = computed(() => {
    const ms = this.remainingMs();
    return ms > 0 && ms <= 60_000;
  });

  readonly formatted = computed(() => {
    const totalSeconds = Math.ceil(this.remainingMs() / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });
}
