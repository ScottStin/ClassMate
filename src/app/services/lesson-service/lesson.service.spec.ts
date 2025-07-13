import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Socket } from 'ngx-socket-io';

import { LessonService } from './lesson.service';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('LessonService', () => {
  let service: LessonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Socket, useValue: socketMock }],
    });
    service = TestBed.inject(LessonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
