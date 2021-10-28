import { TestBed } from '@angular/core/testing';

import { ManageProgramService } from './manage-program.service';

describe('ManageProgramService', () => {
  let service: ManageProgramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageProgramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
