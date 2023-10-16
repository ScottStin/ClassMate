import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class LessonTypeService {
  private readonly baseUrl = `${environment.apiUrl}/lesson-types`;
  private readonly lessonTypeSubject = new BehaviorSubject<LessonTypeDTO[]>([]);
  lessonTypes$ = this.lessonTypeSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAll(): Observable<LessonTypeDTO[]> {
    return this.httpClient.get<LessonTypeDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load lesson types');
      }),
      tap((lessons) => {
        this.lessonTypeSubject.next(lessons);
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
