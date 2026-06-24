import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartTimerService } from '../../core/services/cart-timer.service';
import { SocketService } from '../../core/services/socket.service';
import { StoreService } from '../../core/services/store.service';
import { CartComponent } from './cart/cart.component';
import { ProductCatalogComponent } from './product-catalog/product-catalog.component';

@Component({
  selector: 'app-store-shell',
  standalone: true,
  imports: [ProductCatalogComponent, CartComponent],
  templateUrl: './store-shell.component.html',
  styleUrl: './store-shell.component.scss',
})
export class StoreShellComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly storeService = inject(StoreService);
  readonly socketService = inject(SocketService);
  private readonly cartTimerService = inject(CartTimerService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.cartTimerService;
    this.socketService.connect();
    void this.storeService.loadProducts();
    void this.storeService.loadCart();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
