import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountdownDisplayComponent } from './countdown-display.component';

describe('CountdownDisplayComponent', () => {
  let fixture: ComponentFixture<CountdownDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownDisplayComponent);
  });

  it('formats remaining time as MM:SS from signal input', () => {
    fixture.componentRef.setInput('remainingMs', 125_000);
    fixture.detectChanges();

    expect(fixture.componentInstance.formatted()).toBe('02:05');
    expect(fixture.nativeElement.textContent).toContain('02:05');
  });

  it('marks timer as expired when remainingMs is zero', () => {
    fixture.componentRef.setInput('remainingMs', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.isExpired()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('EXPIRED');
    expect(fixture.nativeElement.querySelector('.countdown--urgent')).toBeTruthy();
  });

  it('marks urgent state below one minute', () => {
    fixture.componentRef.setInput('remainingMs', 45_000);
    fixture.detectChanges();

    expect(fixture.componentInstance.isUrgent()).toBe(true);
    expect(fixture.nativeElement.querySelector('.countdown--urgent')).toBeTruthy();
  });
});
