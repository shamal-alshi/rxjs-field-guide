import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Flattening } from './flattening';

describe('Flattening', () => {
  let component: Flattening;
  let fixture: ComponentFixture<Flattening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flattening],
    }).compileComponents();

    fixture = TestBed.createComponent(Flattening);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
