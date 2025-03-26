/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { ExamQuestionDto } from 'src/app/shared/models/question.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly baseUrl = `${environment.apiUrl}/questions`;
  private readonly questionSubject = new BehaviorSubject<ExamQuestionDto[]>([]);
  questions$ = this.questionSubject.asObservable();

  private readonly feedbackSubmittedSubject = new BehaviorSubject<void>(
    undefined
  );
  feedbackSubmitted$ = this.feedbackSubmittedSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAll(): Observable<ExamQuestionDto[]> {
    return this.httpClient.get<ExamQuestionDto[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load questions');
      }),
      tap((questions) => {
        this.questionSubject.next(questions);
      })
    );
  }

  getAllByExamId(examId: string): Observable<ExamQuestionDto[]> {
    return this.httpClient
      .get<ExamQuestionDto[]>(`${this.baseUrl}?examId=${examId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load questions');
        }),
        tap((questions) => {
          this.questionSubject.next(questions);
        })
      );
  }

  submitStudentResponse(
    questions: ExamQuestionDto[],
    currentUserId: string | undefined,
    examId: string
  ): Observable<ExamQuestionDto[]> {
    return this.httpClient
      .patch<ExamQuestionDto[]>(`${this.baseUrl}/submit-exam/${examId}`, {
        currentUserId,
        questions,
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to submit exam');
        })
      );
  }

  submitTeacherFeedback(
    questions: ExamQuestionDto[],
    currentUserId: string | undefined,
    examId: string,
    studentId: string | undefined,
    score: string | number | undefined,
    aiMarkingComplete: boolean | undefined
  ): Observable<ExamQuestionDto[]> {
    return this.httpClient
      .patch<ExamQuestionDto[]>(`${this.baseUrl}/submit-feedback/${examId}`, {
        currentUserId,
        questions,
        studentId,
        score,
        aiMarkingComplete,
      })
      .pipe(
        tap(() => {
          // Emit an event when feedback is successfully submitted
          this.feedbackSubmittedSubject.next();
        }),
        catchError((error: Error) => {
          this.handleError(error, 'Failed to submit exam');
        })
      );
  }

  /**
   * =================================
   * AI Feedbback / marking
   * todo - move to seperate service
   * ================================
   */

  generateAiFeedbackExamQuestion(data: {
    questionType:
      | 'written-response'
      | 'audio-response'
      | 'repeat-sentence'
      | 'read-outloud'
      | '';
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
  }): Observable<{
    feedback?: string;
    mark: WrittenMark | AudioMark;
  }> {
    const {
      questionType,
      text,
      audioUrl,
      prompt,
      mediaPrompt1,
      mediaPrompt2,
      mediaPrompt3,
    } = data;

    if (questionType === 'written-response') {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

    if (questionType === 'read-outloud') {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

// hardcoded read out loud question prompt:
export const readOutloudQuestionPrompt =
  "Read the given text out loud. Try your best to repeat it word for word. You won't be marked down for accent. You will only be marked on pronunciation, fluency and accuracy.";

// hardcoded repeat sentence question prompt:
export const repeatSentenceQuestionPrompt =
  "Listen to the audio then repeat what you hear. Try your best to say exactly what the speaker in the audio says, word for word. You won't be marked down for accent. You will only be marked on pronunciation, fluency and accuracy.";
