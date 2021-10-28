import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuywindowListComponent } from './buywindow-list.component';

describe('BuywindowListComponent', () => {
  let component: BuywindowListComponent;
  let fixture: ComponentFixture<BuywindowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuywindowListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuywindowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
