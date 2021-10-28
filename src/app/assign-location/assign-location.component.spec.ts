import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignLocationComponent } from './assign-location.component';

describe('AssignLocationComponent', () => {
  let component: AssignLocationComponent;
  let fixture: ComponentFixture<AssignLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
