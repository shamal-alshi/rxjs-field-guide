import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatingObservables } from './creating-observables';

describe('CreatingObservables', () => {
  let component: CreatingObservables;
  let fixture: ComponentFixture<CreatingObservables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatingObservables],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatingObservables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
