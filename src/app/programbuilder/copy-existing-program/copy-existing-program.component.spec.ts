import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyExistingProgramComponent } from './copy-existing-program.component';

describe('CopyExistingProgramComponent', () => {
  let component: CopyExistingProgramComponent;
  let fixture: ComponentFixture<CopyExistingProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyExistingProgramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyExistingProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
