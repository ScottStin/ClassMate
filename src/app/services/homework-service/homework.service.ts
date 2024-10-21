import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import {
  CommentDTO,
  CreateHomeworkDTO,
  HomeworkDTO,
} from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class HomeworkService {
  private readonly baseUrl = `${environment.apiUrl}/homework`;
  private readonly homeworkSubject = new BehaviorSubject<HomeworkDTO[]>([]);
  homework$ = this.homeworkSubject.asObservable();

  private readonly commentSubmittedSubject = new BehaviorSubject<void>(
    undefined
  );
  commentSubmitted$ = this.commentSubmittedSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly socket: Socket
  ) {
    const currentUserString = localStorage.getItem('current_user');

    if (currentUserString !== null) {
      const currentUser = JSON.parse(currentUserString) as UserDTO;
      this.socket.on(
        `homeworkCreated-${currentUser._id}`,
        (newHomework: HomeworkDTO) => {
          this.refreshHomework(newHomework);
        }
      );

      this.socket.on(
        `homeworkCommentCreated-${currentUser._id}`,
        (newHomework: HomeworkDTO) => {
          this.refreshHomework(newHomework);
        }
      );
    }
  }

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

  create(data: CreateHomeworkDTO): Observable<HomeworkDTO> {
    return this.httpClient.post<HomeworkDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new homework exercise');
      })
    );
  }

  update(data: HomeworkDTO): Observable<HomeworkDTO> {
    return this.httpClient
      .patch<HomeworkDTO>(`${this.baseUrl}/${data._id}`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to create new homework exercise');
        })
      );
  }

  delete(data: HomeworkDTO): Observable<HomeworkDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<HomeworkDTO>(`${this.baseUrl}/${data._id}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to delete homework');
          })
        )
    );
  }

  removeStudent(data: {
    studentId: string;
    homeworkItemId: string;
  }): Observable<HomeworkDTO> {
    return this.httpClient
      .delete<HomeworkDTO>(
        `${this.baseUrl}/remove-student?studentId=${data.studentId}&homeworkItemId=${data.homeworkItemId}`
      )
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to remove student from homework exercise'
          );
        })
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
        tap(() => {
          // Emit an event when comment is successfully submitted
          this.commentSubmittedSubject.next();
        }),
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
        tap(() => {
          // Emit an event when comment is successfully editted
          this.commentSubmittedSubject.next();
        }),
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
        tap(() => {
          // Emit an event when comment is successfully deleted
          this.commentSubmittedSubject.next();
        }),
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

  // --- Socket functions:
  private refreshHomework(newHomework: HomeworkDTO): void {
    const currentHomework = this.homeworkSubject.value;
    this.homeworkSubject.next([...currentHomework, newHomework]);
  }
}
