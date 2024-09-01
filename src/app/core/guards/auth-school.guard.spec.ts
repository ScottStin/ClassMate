import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthSchoolGuard } from './auth-school.guard';

describe('AuthSchoolGuard', () => {
  let guard: AuthSchoolGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
      ],
    });
    guard = TestBed.inject(AuthSchoolGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
