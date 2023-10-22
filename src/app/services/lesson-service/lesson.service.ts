import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private readonly baseUrl = `${environment.apiUrl}/lessons`;
  private readonly lessonSubject = new BehaviorSubject<LessonDTO[]>([]);
  lessons$ = this.lessonSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAll(): Observable<LessonDTO[]> {
    return this.httpClient.get<LessonDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load lessons');
      }),
      tap((lessons) => {
        this.lessonSubject.next(lessons);
      })
    );
  }

  create(data: LessonDTO[]): Observable<LessonDTO[]> {
    return this.httpClient.post<LessonDTO[]>(`${this.baseUrl}/new`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new lesson');
      })
    );
  }

  delete(data: LessonDTO): Observable<LessonDTO> {
    console.log(data);
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<LessonDTO>(`${this.baseUrl}/${data._id!}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to create new lesson');
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
