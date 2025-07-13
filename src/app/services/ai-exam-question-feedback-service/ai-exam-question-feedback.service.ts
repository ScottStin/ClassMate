import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import {
  ExamQuestionTypes,
  MatchOptionQuestionDto,
  MultiChoiceQuestionDto,
} from 'src/app/shared/models/question.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class AiExamQuestionFeedbackService {
  private readonly baseUrl = `${environment.apiUrl}/ai-feedback`;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  /**
   * =================================
   * AI Feedbback / marking
   * ================================
   */

  generateAiFeedbackExamQuestion(data: {
    questionType: ExamQuestionTypes;
    text?: string;
    audioUrl?: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
    multiChoiceOptions?: MultiChoiceQuestionDto[];
    reorderSentenceQuestionList?: { text: string }[];
    matchOptionQuestionList?: MatchOptionQuestionDto[];
  }): Observable<{
    feedback?: string;
    mark: WrittenMark | AudioMark | number;
  }> {
    const {
      questionType,
      text,
      audioUrl,
      prompt,
      mediaPrompt1,
      mediaPrompt2,
      mediaPrompt3,
      multiChoiceOptions,
      reorderSentenceQuestionList,
      matchOptionQuestionList,
    } = data;

    if (questionType === 'written-response') {
      if (!text) {
        throw new Error('Text is required for written-response question type');
      }
      return this.generateAiFeedbackWritten({
        text,
        prompt,
        mediaPrompt1,
        mediaPrompt2,
        mediaPrompt3,
      });
    }

    if (questionType === 'audio-response') {
      if (!audioUrl) {
        throw new Error(
          'Audio URL is required for audio-response question type'
        );
      }
      return this.generateAiFeedbackAudio({
        audioUrl,
        prompt,
        mediaPrompt1,
        mediaPrompt2,
        mediaPrompt3,
      });
    }

    if (questionType === 'repeat-sentence') {
      if (!audioUrl) {
        throw new Error(
          'Audio URL is required for repeat-sentence question type'
        );
      }
      return this.generateAiFeedbackRepeatSentence({
        audioUrl,
        prompt,
        mediaPrompt1,
      });
    }

    if (
      ['multiple-choice-single', 'multiple-choice-multi'].includes(questionType)
    ) {
      if (!text || !multiChoiceOptions) {
        throw new Error(
          'Answer and question options are required for multiple choice question type'
        );
      }
      return this.generateAiFeedbackMultiChoice({
        text,
        prompt,
        mediaPrompt1,
        mediaPrompt2,
        mediaPrompt3,
        multiChoiceOptions,
      });
    }

    if (questionType === 'reorder-sentence') {
      if (!text || !reorderSentenceQuestionList) {
        throw new Error(
          'Answer and question options are required for reorder-sentence question type'
        );
      }
      return this.generateAiFeedbackReorderSentence({
        text,
        prompt,
        mediaPrompt1,
        mediaPrompt2,
        mediaPrompt3,
        reorderSentenceQuestionList,
      });
    }

    if (questionType === 'match-options') {
      if (!text || !matchOptionQuestionList) {
        throw new Error(
          'Answer and question options are required for match option question type'
        );
      }
      return this.generateAiFeedbackMatchOption({
        text,
        prompt,
        mediaPrompt1,
        mediaPrompt2,
        mediaPrompt3,
        matchOptionQuestionList,
      });
    }

    if (questionType === 'read-outloud') {
      if (!audioUrl) {
        throw new Error('Audio URL is required for read-outloud question type');
      }
      return this.generateAiFeedbacReadOutloud({
        audioUrl,
        prompt,
      });
    }

    throw new Error('Invalid questionType provided');
  }

  generateAiFeedbackWritten(data: {
    text: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
  }): Observable<{
    feedback?: string;
    mark: WrittenMark;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: WrittenMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/written-question`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for written exam question'
          );
        })
      );
  }

  generateAiFeedbackAudio(data: {
    audioUrl: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
  }): Observable<{
    feedback?: string;
    mark: AudioMark;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: AudioMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/audio-question`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for audio exam question'
          );
        })
      );
  }

  generateAiFeedbackRepeatSentence(data: {
    audioUrl: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
  }): Observable<{
    feedback?: string;
    mark: RepeatSentenceMark;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: AudioMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/repeat-sentence`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for repeat sentence exam question'
          );
        })
      );
  }

  generateAiFeedbacReadOutloud(data: {
    audioUrl: string;
    prompt: string;
  }): Observable<{
    feedback?: string;
    mark: ReadOutloudMark;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: AudioMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/read-outloud`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for read outloud exam question'
          );
        })
      );
  }

  generateAiFeedbackMultiChoice(data: {
    text: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
    multiChoiceOptions: MultiChoiceQuestionDto[];
  }): Observable<{
    feedback?: string;
    mark: number;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: number;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/multi-choice`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for multi-choice exam question'
          );
        })
      );
  }

  generateAiFeedbackReorderSentence(data: {
    text: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
    reorderSentenceQuestionList: { text: string }[];
  }): Observable<{
    feedback?: string;
    mark: number;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: number;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/reorder-sentence`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for reorder-sentence exam question'
          );
        })
      );
  }

  generateAiFeedbackMatchOption(data: {
    text: string;
    prompt: string;
    mediaPrompt1?: {
      url: string;
      type: string;
    };
    mediaPrompt2?: {
      url: string;
      type: string;
    };
    mediaPrompt3?: {
      url: string;
      type: string;
    };
    matchOptionQuestionList: MatchOptionQuestionDto[];
  }): Observable<{
    feedback?: string;
    mark: number;
  }> {
    return this.httpClient
      .post<{
        feedback: string;
        mark: number;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/match-options`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for match-option exam question'
          );
        })
      );
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }
    throw this.errorService.handleGenericError(error, message);
  }
}

export interface WrittenMark {
  vocabMark?: number;
  grammarMark?: number;
  contentMark?: number;
}

export interface AudioMark extends WrittenMark {
  pronunciationMark?: number;
  fluencyMark?: number;
}

export interface RepeatSentenceMark {
  pronunciationMark?: number;
  fluencyMark?: number;
  accuracyMark?: number;
}

export interface ReadOutloudMark {
  pronunciationMark?: number;
  fluencyMark?: number;
  accuracyMark?: number;
}
