import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramOrderComponent } from './program-order.component';

describe('ProgramOrderComponent', () => {
  let component: ProgramOrderComponent;
  let fixture: ComponentFixture<ProgramOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
