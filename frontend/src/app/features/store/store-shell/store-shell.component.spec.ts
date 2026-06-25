import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartTimerService } from '../../../core/services/cart-timer.service';
import { SocketService } from '../../../core/services/socket.service';
import { StoreService } from '../../../core/services/store.service';
import { StoreShellComponent } from './store-shell.component';

describe('StoreShellComponent', () => {
  let fixture: ComponentFixture<StoreShellComponent>;
  let authService: AuthService;
  let storeService: StoreService;
  let socketService: SocketService;
  let router: Router;

  beforeEach(async () => {
    sessionStorage.setItem(
      'flash-sale-user',
      JSON.stringify({ id: 'user-1', name: 'Arcade Pilot' }),
    );

    await TestBed.configureTestingModule({
      imports: [StoreShellComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreShellComponent);
    authService = TestBed.inject(AuthService);
    storeService = TestBed.inject(StoreService);
    socketService = TestBed.inject(SocketService);
    router = TestBed.inject(Router);
    TestBed.inject(CartTimerService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('injects feature services and renders arcade shell header', () => {
    socketService.connected.set(true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.store-title')?.textContent).toContain('Operational');
    expect(element.querySelector('.arcade-label.store-kicker')?.textContent).toContain(
      'Flash Sale',
    );
    expect(element.querySelector('.store-player')?.textContent).toContain('Arcade Pilot');
    expect(element.querySelector('.store-live')?.textContent).toContain('Live Feed');
    expect(element.querySelector('.arcade-btn.store-logout')).toBeTruthy();
    expect(element.querySelector('app-product-catalog')).toBeTruthy();
    expect(element.querySelector('app-cart')).toBeTruthy();
  });

  it('shows a global error banner when storeService.error is set', () => {
    vi.spyOn(storeService, 'loadProducts').mockResolvedValue();
    vi.spyOn(storeService, 'loadCart').mockResolvedValue();
    fixture.detectChanges();

    storeService['errorSignal'].set('Checkout failed');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.store-error-text')?.textContent).toBe(
      'Checkout failed',
    );
  });

  it('logs out and routes to login', async () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await fixture.componentInstance.onLogout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('disconnects socket when the shell is destroyed', () => {
    const disconnectSpy = vi.spyOn(socketService, 'disconnect');

    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('loads catalog and cart data on init', () => {
    const loadProductsSpy = vi.spyOn(storeService, 'loadProducts').mockResolvedValue();
    const loadCartSpy = vi.spyOn(storeService, 'loadCart').mockResolvedValue();
    const connectSpy = vi.spyOn(socketService, 'connect');

    fixture.componentInstance.ngOnInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(loadProductsSpy).toHaveBeenCalled();
    expect(loadCartSpy).toHaveBeenCalled();
  });
});
