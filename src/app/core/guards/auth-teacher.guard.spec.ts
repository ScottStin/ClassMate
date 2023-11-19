import { TestBed } from '@angular/core/testing';

import { AuthTeacherGuard } from './auth-teacher.guard';

describe('AuthTeacherGuard', () => {
  let guard: AuthTeacherGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthTeacherGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
