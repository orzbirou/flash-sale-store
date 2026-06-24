import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api-response.model';
import type { User } from '../models/user.model';

const USER_STORAGE_KEY = 'flash-sale-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userSignal = signal<User | null>(this.loadFromSession());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  getUserId(): string | null {
    return this.user()?.id ?? null;
  }

  async login(name: string): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<User>>(`${environment.apiUrl}/auth/login`, { name }),
    );
    this.userSignal.set(response.data);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
    return response.data;
  }

  logout(): void {
    this.userSignal.set(null);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }

  private loadFromSession(): User | null {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof (parsed as User).id === 'string' &&
        typeof (parsed as User).name === 'string'
      ) {
        return parsed as User;
      }
    } catch {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }

    return null;
  }
}
