import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LessonTypeService } from './lesson-type.service';

describe('LessonTypeService', () => {
  let service: LessonTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LessonTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
