import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthStoreService } from './auth-store.service';

describe('AuthStoreService', () => {
  let service: AuthStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(AuthStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
