import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AiExamPromptService } from './ai-exam-prompt.service';

describe('AiExamPromptService', () => {
  let service: AiExamPromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [],
    });
    service = TestBed.inject(AiExamPromptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
