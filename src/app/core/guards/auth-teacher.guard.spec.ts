import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthTeacherGuard } from './auth-teacher.guard';

describe('AuthTeacherGuard', () => {
  let guard: AuthTeacherGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
      ],
    });
    guard = TestBed.inject(AuthTeacherGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
