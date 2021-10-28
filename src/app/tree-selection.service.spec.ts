import { TestBed } from '@angular/core/testing';

import { TreeSelectionService } from './tree-selection.service';

describe('TreeSelectionService', () => {
  let service: TreeSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
