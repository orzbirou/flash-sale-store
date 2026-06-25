import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockBadgeComponent } from './stock-badge.component';

describe('StockBadgeComponent', () => {
  let fixture: ComponentFixture<StockBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockBadgeComponent);
  });

  it('renders arcade stock label and monospace count', () => {
    fixture.componentRef.setInput('stock', 12);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.arcade-label')?.textContent).toBe('STK');
    expect(element.querySelector('.stock-badge')?.textContent?.trim()).toBe('12');
  });

  it('applies sold-out styling when stock is zero', () => {
    fixture.componentRef.setInput('stock', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.stock-badge--sold-out')).toBeTruthy();
  });
});
