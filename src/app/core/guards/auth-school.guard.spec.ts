import { TestBed } from '@angular/core/testing';

import { AuthSchoolGuard } from './auth-school.guard';

describe('AuthSchoolGuard', () => {
  let guard: AuthSchoolGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthSchoolGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
