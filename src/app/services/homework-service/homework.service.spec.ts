import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Socket } from 'ngx-socket-io';

import { HomeworkService } from './homework.service';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('HomeworkService', () => {
  let service: HomeworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Socket, useValue: socketMock }],
    });
    service = TestBed.inject(HomeworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
