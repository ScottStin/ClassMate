import { TestBed } from '@angular/core/testing';

import { AiExamQuestionFeedbackService } from './ai-exam-question-feedback.service';

describe('AiExamQuestionFeedbackService', () => {
  let service: AiExamQuestionFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiExamQuestionFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
