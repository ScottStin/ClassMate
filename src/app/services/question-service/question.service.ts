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
        console.log(questions);
        this.questionSubject.next(questions);
      })
    );
  }

  submitStudentResponse(
    questions: QuestionList[],
    currentUser: string | undefined,
    examId: string | number | undefined
  ): Observable<QuestionList[]> {
    console.log(questions);
    console.log(currentUser);
    console.log(examId);
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
    score: string | number
  ): Observable<QuestionList[]> {
    console.log(questions);
    console.log(currentUser);
    console.log(examId);
    console.log(student);
    return this.httpClient
      .patch<QuestionList[]>(`${this.baseUrl}/submit-feedback/${examId!}`, {
        currentUser,
        questions,
        student,
        score,
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to submit exam');
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
