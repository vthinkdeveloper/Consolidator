import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyProgramMobileComponent } from './modify-program-mobile.component';

describe('ModifyProgramMobileComponent', () => {
  let component: ModifyProgramMobileComponent;
  let fixture: ComponentFixture<ModifyProgramMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyProgramMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyProgramMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
