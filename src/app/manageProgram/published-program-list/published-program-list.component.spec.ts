import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedProgramListComponent } from './published-program-list.component';

describe('PublishedProgramListComponent', () => {
  let component: PublishedProgramListComponent;
  let fixture: ComponentFixture<PublishedProgramListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishedProgramListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishedProgramListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
