import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreationAndSubjects } from './creation-and-subjects';

describe('CreationAndSubjects', () => {
  let component: CreationAndSubjects;
  let fixture: ComponentFixture<CreationAndSubjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationAndSubjects],
    }).compileComponents();

    fixture = TestBed.createComponent(CreationAndSubjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
