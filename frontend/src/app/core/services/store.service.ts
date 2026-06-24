import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type { ApiResponse } from '../models/api-response.model';
import type { CartItem, Order } from '../models/cart-item.model';
import type { Product } from '../models/product.model';

export class StoreError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'StoreError';
  }
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly cartSignal = signal<CartItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastOrderSignal = signal<Order | null>(null);
  private readonly productErrorsSignal = signal<Record<string, string>>({});

  readonly products = this.productsSignal.asReadonly();
  readonly cartItems = this.cartSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly lastOrder = this.lastOrderSignal.asReadonly();
  readonly productErrors = this.productErrorsSignal.asReadonly();

  readonly cartTotalCents = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.quantity * item.product.priceCents,
      0,
    ),
  );

  readonly isCartEmpty = computed(() => this.cartItems().length === 0);

  async loadProducts(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Product[]>>(`${environment.apiUrl}/products`),
      );
      this.productsSignal.set(response.data);
    } catch (err: unknown) {
      this.errorSignal.set(this.extractErrorMessage(err));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadCart(): Promise<void> {
    const headers = this.buildAuthHeaders();
    if (!headers) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<CartItem[]>>(`${environment.apiUrl}/cart`, { headers }),
      );
      this.cartSignal.set(response.data);
    } catch (err: unknown) {
      this.errorSignal.set(this.extractErrorMessage(err));
    }
  }

  async addToCart(productId: string, quantity = 1): Promise<void> {
    const headers = this.buildAuthHeaders();
    if (!headers) {
      return;
    }

    this.clearProductError(productId);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Product>>(
          `${environment.apiUrl}/cart/items`,
          { productId, quantity },
          { headers },
        ),
      );

      this.patchProductStock(productId, response.data.stock);
      await this.loadCart();
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err);
      if (err instanceof HttpErrorResponse && err.status === 409) {
        this.setProductError(productId, 'SOLD OUT');
      } else {
        this.setProductError(productId, message);
      }
      throw new StoreError(message, err instanceof HttpErrorResponse ? err.status : 500);
    }
  }

  async removeFromCart(productId: string): Promise<void> {
    const headers = this.buildAuthHeaders();
    if (!headers) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<Product>>(
          `${environment.apiUrl}/cart/items/${productId}`,
          { headers },
        ),
      );

      this.patchProductStock(productId, response.data.stock);
      await this.loadCart();
    } catch (err: unknown) {
      this.errorSignal.set(this.extractErrorMessage(err));
      throw err;
    }
  }

  async checkout(): Promise<Order> {
    const headers = this.buildAuthHeaders();
    if (!headers) {
      throw new StoreError('Not authenticated', 401);
    }

    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Order>>(
          `${environment.apiUrl}/orders/checkout`,
          {},
          { headers },
        ),
      );

      this.lastOrderSignal.set(response.data);
      this.cartSignal.set([]);
      return response.data;
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err);
      this.errorSignal.set(message);
      throw new StoreError(message, err instanceof HttpErrorResponse ? err.status : 500);
    }
  }

  clearLastOrder(): void {
    this.lastOrderSignal.set(null);
  }

  patchProductStock(productId: string, stock: number): void {
    this.productsSignal.update((list) =>
      list.map((product) =>
        product.id === productId ? { ...product, stock } : product,
      ),
    );
  }

  private buildAuthHeaders(): HttpHeaders | null {
    const userId = this.authService.getUserId();
    if (!userId) {
      return null;
    }

    return new HttpHeaders({ 'x-user-id': userId });
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: string } | null;
      if (body && typeof body.error === 'string') {
        return body.error;
      }
      return err.message;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'An unexpected error occurred';
  }

  private setProductError(productId: string, message: string): void {
    this.productErrorsSignal.update((errors) => ({ ...errors, [productId]: message }));
  }

  private clearProductError(productId: string): void {
    this.productErrorsSignal.update((errors) => {
      const next = { ...errors };
      delete next[productId];
      return next;
    });
  }
}
