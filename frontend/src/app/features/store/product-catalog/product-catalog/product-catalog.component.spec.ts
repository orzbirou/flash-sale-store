import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import type { Product } from '../../../../core/models/product.model';
import { StoreService } from '../../../../core/services/store.service';
import { ProductCatalogComponent } from './product-catalog.component';

function createProduct(id: string, name: string): Product {
  return {
    id,
    name,
    description: `${name} description`,
    priceCents: 1_999,
    stock: 4,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
  };
}

describe('ProductCatalogComponent', () => {
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let storeService: StoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    storeService = TestBed.inject(StoreService);
    fixture = TestBed.createComponent(ProductCatalogComponent);
  });

  it('injects StoreService and renders loading arcade state', () => {
    storeService['loadingSignal'].set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.storeService).toBe(storeService);
    expect(fixture.nativeElement.querySelector('.catalog-title')?.textContent).toContain(
      'Available Drops',
    );
    expect(fixture.nativeElement.querySelector('.catalog-loading')?.textContent).toContain(
      'Loading catalog',
    );
  });

  it('renders a product card per catalog signal entry', () => {
    storeService['loadingSignal'].set(false);
    storeService['productsSignal'].set([
      createProduct('p-1', 'Vintage Graphic Tee'),
      createProduct('p-2', 'Wireless Earbuds'),
    ]);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-product-card');
    expect(cards.length).toBe(2);
  });

  it('tracks add-to-cart state and delegates to StoreService', async () => {
    const addSpy = vi.spyOn(storeService, 'addToCart').mockResolvedValue();

    storeService['loadingSignal'].set(false);
    storeService['productsSignal'].set([createProduct('p-1', 'Flash Sneakers')]);
    fixture.detectChanges();

    await fixture.componentInstance.onAddToCart('p-1');

    expect(addSpy).toHaveBeenCalledWith('p-1', 1);
    expect(fixture.componentInstance.addingProductId()).toBeNull();
  });

  it('exposes per-card error messages from StoreService productErrors signal', () => {
    storeService['loadingSignal'].set(false);
    storeService['productsSignal'].set([createProduct('p-1', 'Flash Sneakers')]);
    storeService['productErrorsSignal'].set({ 'p-1': 'SOLD OUT' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.product-card-error')?.textContent).toBe(
      'SOLD OUT',
    );
  });
});
