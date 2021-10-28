import { TestBed } from '@angular/core/testing';

import { BuyWindowService } from './buy-window.service';

describe('BuyWindowService', () => {
  let service: BuyWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
