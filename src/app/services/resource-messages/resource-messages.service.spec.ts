import { TestBed } from '@angular/core/testing';

import { ResourceMessagesService } from './resource-messages.service';

describe('ResourceMessagesService', () => {
  let service: ResourceMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
