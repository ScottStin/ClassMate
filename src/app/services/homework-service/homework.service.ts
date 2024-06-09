import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { CommentDTO, HomeworkDTO } from 'src/app/shared/models/homework.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class HomeworkService {
  private readonly baseUrl = `${environment.apiUrl}/homework`;
  private readonly homeworkSubject = new BehaviorSubject<HomeworkDTO[]>([]);
  homework$ = this.homeworkSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  /**
   * ==============================
   *  Homework
   * ==============================
   */

  getAll(): Observable<HomeworkDTO[]> {
    return this.httpClient.get<HomeworkDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load homework');
      }),
      tap((homework) => {
        this.homeworkSubject.next(homework);
      })
    );
  }

  getAllBySchoolId(currentSchoolId: string): Observable<HomeworkDTO[]> {
    return this.httpClient
      .get<HomeworkDTO[]>(`${this.baseUrl}?currentSchoolId=${currentSchoolId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load homework');
        }),
        tap((homework) => {
          this.homeworkSubject.next(homework);
        })
      );
  }

  create(data: HomeworkDTO): Observable<HomeworkDTO> {
    return this.httpClient.post<HomeworkDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new homework exercise');
      })
    );
  }

  delete(data: HomeworkDTO): Observable<HomeworkDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<HomeworkDTO>(`${this.baseUrl}/${data._id!}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to delete homework');
          })
        )
    );
  }

  /**
   * ==============================
   *  Comments (to do, move comments to their own service and create dedicated comment model/route in backend)
   * ==============================
   */

  addComment(data: {
    feedback: CommentDTO;
    homeworkId: string;
  }): Observable<CommentDTO> {
    return this.httpClient
      .post<CommentDTO>(`${this.baseUrl}/new-comment`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to add new comment to homework exercise'
          );
        })
      );
  }

  editComment(data: {
    feedback: CommentDTO;
    homeworkId: string;
  }): Observable<CommentDTO> {
    return this.httpClient
      .post<CommentDTO>(`${this.baseUrl}/update-comment`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to update comment for homework exercise'
          );
        })
      );
  }

  deleteComment(data: {
    feedback: CommentDTO;
    homeworkId: string;
  }): Observable<CommentDTO> {
    return this.httpClient
      .post<CommentDTO>(`${this.baseUrl}/delete-comment`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to delete comment for homework exercise'
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
