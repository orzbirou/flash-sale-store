import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders arcade typography and player name form', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.arcade-panel')).toBeTruthy();
    expect(element.querySelector('.arcade-label')?.textContent).toContain('Flash Sale');
    expect(element.querySelector('.login-title')?.textContent).toContain('Enter Player Name');
    expect(element.querySelector('.arcade-btn')?.textContent?.trim()).toBe('START');
    expect(element.querySelector('#player-name')).toBeTruthy();
  });

  it('disables submit until a player name is entered', () => {
    const submitButton = fixture.nativeElement.querySelector(
      '.login-submit',
    ) as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);

    fixture.componentInstance.name.set('Arcade Pilot');
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(false);
  });

  it('routes to the store after a successful login via inject() services', async () => {
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({
      id: 'user-1',
      name: 'Arcade Pilot',
    });
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.name.set('Arcade Pilot');
    fixture.detectChanges();

    await fixture.componentInstance.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith('Arcade Pilot');
    expect(navigateSpy).toHaveBeenCalledWith(['/store']);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('surfaces an inline error when login fails', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('network'));

    fixture.componentInstance.name.set('Arcade Pilot');
    fixture.detectChanges();

    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('Login failed. Please try again.');
    expect(fixture.nativeElement.querySelector('.login-error')?.textContent).toContain(
      'Login failed',
    );
  });
});
