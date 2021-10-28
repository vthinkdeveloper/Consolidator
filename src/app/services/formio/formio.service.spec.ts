import { TestBed } from '@angular/core/testing';

import { FormioService } from './formio.service';

describe('FormioService', () => {
  let service: FormioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
