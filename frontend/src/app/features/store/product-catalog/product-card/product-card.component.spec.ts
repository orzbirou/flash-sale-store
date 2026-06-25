import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from './product-card.component';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-test-1',
    name: 'Flash Sale Sneakers',
    description: 'Limited-run test SKU',
    priceCents: 12_500,
    stock: 5,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
  });

  function actionButton(): HTMLButtonElement {
    const button = fixture.nativeElement.querySelector(
      'button.product-card-action',
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    return button as HTMLButtonElement;
  }

  it('enables and shows the Add To Cart button when stock is greater than zero', () => {
    fixture.componentRef.setInput('product', createProduct({ stock: 3 }));
    fixture.detectChanges();

    const button = actionButton();

    expect(button.disabled).toBe(false);
    expect(button.textContent?.trim()).toBe('Add To Cart');
    expect(button.classList.contains('arcade-btn')).toBe(true);
  });

  it('reactively disables the button and shows Sold Out when stock drops to zero', () => {
    fixture.componentRef.setInput('product', createProduct({ stock: 2 }));
    fixture.detectChanges();

    expect(actionButton().disabled).toBe(false);
    expect(actionButton().textContent?.trim()).toBe('Add To Cart');

    fixture.componentRef.setInput('product', createProduct({ stock: 0 }));
    fixture.detectChanges();

    const button = actionButton();

    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toBe('Sold Out');
    expect(button.textContent?.trim().toUpperCase()).toBe('SOLD OUT');
  });
});
