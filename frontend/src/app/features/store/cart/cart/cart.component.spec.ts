import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import type { CartItem, Order } from '../../../../core/models/cart-item.model';
import type { Product } from '../../../../core/models/product.model';
import { CartTimerService } from '../../../../core/services/cart-timer.service';
import { StoreService } from '../../../../core/services/store.service';
import { CartComponent } from './cart.component';

function createCartItem(
  id: string,
  productId: string,
  name: string,
  quantity: number,
  priceCents: number,
): CartItem {
  const product: Product = {
    id: productId,
    name,
    description: `${name} description`,
    priceCents,
    stock: 2,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };

  return {
    id,
    userId: 'user-1',
    productId,
    quantity,
    expiresAt: '2026-06-24T12:00:00.000Z',
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    product,
  };
}

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let storeService: StoreService;
  let cartTimerService: CartTimerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    storeService = TestBed.inject(StoreService);
    cartTimerService = TestBed.inject(CartTimerService);
    fixture = TestBed.createComponent(CartComponent);
  });

  it('injects StoreService and CartTimerService', () => {
    expect(fixture.componentInstance.storeService).toBe(storeService);
    expect(fixture.componentInstance.cartTimer).toBe(cartTimerService);
  });

  it('renders empty cart arcade state from signals', () => {
    storeService['cartSignal'].set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cart-title')?.textContent).toContain(
      'Your Cart',
    );
    expect(fixture.nativeElement.querySelector('.cart-empty')?.textContent).toContain(
      'Cart is empty',
    );
  });

  it('computes and renders cart total from StoreService cartTotalCents signal', () => {
    storeService['cartSignal'].set([
      createCartItem('line-1', 'p-1', 'Graphic Tee', 1, 2_500),
      createCartItem('line-2', 'p-2', 'Earbuds', 2, 1_500),
    ]);
    fixture.detectChanges();

    expect(storeService.cartTotalCents()).toBe(5_500);
    expect(fixture.nativeElement.querySelector('.cart-total')?.textContent).toContain('$55.00');
    expect(fixture.nativeElement.querySelectorAll('app-cart-line').length).toBe(2);
  });

  it('shows order confirmation when lastOrder signal is populated', () => {
    const order: Order = {
      id: 'order-123',
      userId: 'user-1',
      status: 'COMPLETED',
      totalCents: 9_999,
      createdAt: '2026-06-24T00:00:00.000Z',
      orderItems: [],
    };

    storeService['lastOrderSignal'].set(order);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cart-success-heading')?.textContent).toContain(
      'Order Confirmed',
    );
    expect(fixture.nativeElement.querySelector('.cart-success-id')?.textContent).toContain(
      'order-123',
    );
    expect(fixture.nativeElement.querySelector('.cart-success-total')?.textContent).toContain(
      '$99.99',
    );
  });

  it('delegates checkout to StoreService and toggles checkingOut signal', async () => {
    const checkoutSpy = vi.spyOn(storeService, 'checkout').mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'COMPLETED',
      totalCents: 1_000,
      createdAt: '2026-06-24T00:00:00.000Z',
      orderItems: [],
    });

    storeService['cartSignal'].set([createCartItem('line-1', 'p-1', 'Bottle', 1, 1_000)]);
    fixture.detectChanges();

    const checkoutPromise = fixture.componentInstance.onCheckout();
    expect(fixture.componentInstance.checkingOut()).toBe(true);

    await checkoutPromise;

    expect(checkoutSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.checkingOut()).toBe(false);
  });

  it('surfaces checkout errors inline in the cart footer', () => {
    storeService['cartSignal'].set([createCartItem('line-1', 'p-1', 'Bottle', 1, 1_000)]);
    storeService['errorSignal'].set('Cart reservation has expired.');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cart-error')?.textContent).toBe(
      'Cart reservation has expired.',
    );
  });
});
