import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyExistingItemMobileComponent } from './copy-existing-item-mobile.component';

describe('CopyExistingItemMobileComponent', () => {
  let component: CopyExistingItemMobileComponent;
  let fixture: ComponentFixture<CopyExistingItemMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyExistingItemMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyExistingItemMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
