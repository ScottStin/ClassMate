import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';

import { UserService } from './user.service';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('UserMessageService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [{ provide: Socket, useValue: socketMock }],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
