import { TestBed } from '@angular/core/testing';

import { TempStylesService } from './temp-styles-service.service';

describe('TempStylesService', () => {
  let service: TempStylesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempStylesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
