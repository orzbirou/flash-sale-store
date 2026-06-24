import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    const trimmed = this.name().trim();
    if (!trimmed) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(trimmed);
      await this.router.navigate(['/store']);
    } catch {
      this.error.set('Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
