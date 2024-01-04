import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { QuestionList } from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private readonly baseUrl = `${environment.apiUrl}/exams`;
  private readonly examSubject = new BehaviorSubject<ExamDTO[]>([]);
  exams$ = this.examSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAll(): Observable<ExamDTO[]> {
    return this.httpClient.get<ExamDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load exams');
      }),
      tap((exams) => {
        console.log(exams);
        this.examSubject.next(exams);
      })
    );
  }

  create(exam: ExamDTO, questions: QuestionList[]): Observable<ExamDTO> {
    console.log(exam);
    return this.httpClient
      .post<ExamDTO>(`${this.baseUrl}/new`, { exam, questions })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to create new exam');
        })
      );
  }

  registerForExam(exam: ExamDTO, student: UserDTO): Observable<ExamDTO> {
    console.log(exam);
    return this.httpClient
      .patch<ExamDTO>(`${this.baseUrl}/register/${exam._id!}`, student)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to sign up for exam');
        })
      );
  }

  delete(data: ExamDTO): Observable<ExamDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<ExamDTO>(`${this.baseUrl}/${data._id!}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to delete exam');
          })
        )
    );
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }
    throw this.errorService.handleGenericError(error, message);
  }
}
