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

  /**
   * Get all exam questions:
   */
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

  /**
   * Get all exam questions by exma id:
   */
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

  /**
   * Submit a student's response to an exam question:
   */
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

  /**
   * Submit a teacher's feedback to a student's question response:
   */
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
          this.handleError(error, 'Failed to submit exam question feedback');
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

/**
 * Hardcoded question prompts:
 */

// hardcoded read out loud question prompt:
export const readOutloudQuestionPrompt =
  "Read the given text out loud. Try your best to repeat it word for word. You won't be marked down for accent. You will only be marked on pronunciation, fluency and accuracy.";

// hardcoded repeat sentence question prompt:
export const repeatSentenceQuestionPrompt =
  "Listen to the audio then repeat what you hear. Try your best to say exactly what the speaker in the audio says, word for word. You won't be marked down for accent. You will only be marked on pronunciation, fluency and accuracy.";
