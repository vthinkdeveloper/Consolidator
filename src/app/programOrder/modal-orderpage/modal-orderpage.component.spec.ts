import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOrderpageComponent } from './modal-orderpage.component';

describe('ModalOrderpageComponent', () => {
  let component: ModalOrderpageComponent;
  let fixture: ComponentFixture<ModalOrderpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalOrderpageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOrderpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
