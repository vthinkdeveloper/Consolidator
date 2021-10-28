import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuywindowComponent } from './buywindow.component';

describe('BuywindowComponent', () => {
  let component: BuywindowComponent;
  let fixture: ComponentFixture<BuywindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuywindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuywindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
