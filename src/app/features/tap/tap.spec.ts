import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tap } from './tap';

describe('Tap', () => {
  let component: Tap;
  let fixture: ComponentFixture<Tap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tap],
    }).compileComponents();

    fixture = TestBed.createComponent(Tap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
