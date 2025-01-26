/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { QuestionList } from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly baseUrl = `${environment.apiUrl}/questions`;
  private readonly questionSubject = new BehaviorSubject<QuestionList[]>([]);
  questions$ = this.questionSubject.asObservable();

  private readonly feedbackSubmittedSubject = new BehaviorSubject<void>(
    undefined
  );
  feedbackSubmitted$ = this.feedbackSubmittedSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAll(): Observable<QuestionList[]> {
    return this.httpClient.get<QuestionList[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load questions');
      }),
      tap((questions) => {
        this.questionSubject.next(questions);
      })
    );
  }

  submitStudentResponse(
    questions: QuestionList[],
    currentUser: string | undefined,
    examId: string | number | undefined
  ): Observable<QuestionList[]> {
    return this.httpClient
      .patch<QuestionList[]>(`${this.baseUrl}/submit-exam/${examId!}`, {
        currentUser,
        questions,
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to submit exam');
        })
      );
  }

  submitTeacherFeedback(
    questions: QuestionList[],
    currentUser: string | undefined,
    examId: string | number | undefined,
    student: string | undefined,
    score: string | number | undefined,
    aiMarkingComplete: boolean | undefined
  ): Observable<QuestionList[]> {
    return this.httpClient
      .patch<QuestionList[]>(`${this.baseUrl}/submit-feedback/${examId!}`, {
        currentUser,
        questions,
        student,
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
    questionType: 'written-response' | 'audio-response' | 'repeat-sentence';
    text?: string;
    audioUrl?: string;
    prompt: string;
  }): Observable<{
    feedback?: string;
    mark: WrittenMark | AudioMark;
  }> {
    const { questionType, text, audioUrl, prompt } = data;

    if (questionType === 'written-response') {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!text) {
        throw new Error('Text is required for written-response question type');
      }
      return this.generateAiFeedbackWritten({ text, prompt });
    }

    if (questionType === 'audio-response') {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!audioUrl) {
        throw new Error(
          'Audio URL is required for audio-response question type'
        );
      }
      return this.generateAiFeedbackAudio({ audioUrl, prompt });
    }

    throw new Error('Invalid questionType provided');
  }

  generateAiFeedbackWritten(data: {
    text: string;
    prompt: string;
  }): Observable<{
    feedback?: string;
    mark: WrittenMark;
  }> {
    const { text, prompt } = data;
    return this.httpClient
      .post<{
        feedback: string;
        mark: WrittenMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/written-question`, {
        text,
        prompt,
      })
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
  }): Observable<{
    feedback?: string;
    mark: AudioMark;
  }> {
    const { audioUrl, prompt } = data;
    return this.httpClient
      .post<{
        feedback: string;
        mark: AudioMark;
      }>(`${this.baseUrl}/generate-ai-exam-feedback/audio-question`, {
        audioUrl,
        prompt,
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to generate AI Feedback for audio exam question'
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
