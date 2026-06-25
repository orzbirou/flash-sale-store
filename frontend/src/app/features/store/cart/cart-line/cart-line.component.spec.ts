import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { CartItem } from '../../../../core/models/cart-item.model';
import type { Product } from '../../../../core/models/product.model';
import { CartLineComponent } from './cart-line.component';

function createCartItem(): CartItem {
  const product: Product = {
    id: 'p-1',
    name: 'Vintage Graphic Tee',
    description: 'Screen print',
    priceCents: 3_499,
    stock: 2,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };

  return {
    id: 'line-1',
    userId: 'user-1',
    productId: product.id,
    quantity: 2,
    expiresAt: '2026-06-24T12:00:00.000Z',
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    product,
  };
}

describe('CartLineComponent', () => {
  let fixture: ComponentFixture<CartLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartLineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartLineComponent);
  });

  it('renders line item details and arcade price formatting', () => {
    fixture.componentRef.setInput('item', createCartItem());
    fixture.componentRef.setInput('remainingMs', 90_000);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.cart-line-name')?.textContent).toContain('Vintage Graphic Tee');
    expect(element.querySelector('.cart-line-price')?.textContent).toContain('$34.99');
    expect(element.querySelector('app-countdown-display')).toBeTruthy();
    expect(element.querySelector('.arcade-label')?.textContent).toContain('Expires');
  });

  it('emits remove with product id when remove is clicked', () => {
    fixture.componentRef.setInput('item', createCartItem());
    fixture.componentRef.setInput('remainingMs', 90_000);
    fixture.detectChanges();

    const removeSpy = vi.fn();
    fixture.componentInstance.remove.subscribe(removeSpy);

    (fixture.nativeElement.querySelector('.cart-line-remove') as HTMLButtonElement).click();

    expect(removeSpy).toHaveBeenCalledWith('p-1');
  });
});
