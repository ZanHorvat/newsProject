import { TestBed } from '@angular/core/testing';

import { RefreshServiceService } from './refresh-service.service';

describe('RefreshServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RefreshServiceService = TestBed.get(RefreshServiceService);
    expect(service).toBeTruthy();
  });
});
