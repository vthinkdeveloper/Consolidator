import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFormioComponent } from './create-formio.component';

describe('CreateFormioComponent', () => {
  let component: CreateFormioComponent;
  let fixture: ComponentFixture<CreateFormioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFormioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFormioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
