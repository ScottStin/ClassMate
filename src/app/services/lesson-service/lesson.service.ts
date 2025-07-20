import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { CreateLessonDTO, LessonDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';
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
    private readonly errorService: ErrorService,
    private readonly socket: Socket
  ) {
    const currentSchoolString = localStorage.getItem('current_school');
    const currentUserString = localStorage.getItem('current_user');

    if (currentSchoolString !== null && currentUserString !== null) {
      const currentUser = JSON.parse(currentUserString) as UserDTO | undefined;
      const currentSchool = JSON.parse(currentSchoolString) as
        | SchoolDTO
        | undefined;
      const currentUserLevel = currentUser?.level ?? undefined;

      if (currentUser?._id && currentSchool?._id) {
        this.socket.on(
          `lessonEvent-${currentSchool._id}`,
          (event: { data: LessonDTO | LessonDTO[]; action: string }) => {
            //
            // Only update the lesson data if the student's level matches the new lesson, or the student's level is not set:
            if (
              event.action === 'lessonCreated' &&
              (!currentUserLevel ||
                (event.data as LessonDTO[])[0].level
                  .map((level) => level.shortName)
                  .includes(currentUserLevel.shortName))
            ) {
              this.refreshLessons(event.data as LessonDTO[]);
            }
            if (
              event.action === 'lessonUpdated' &&
              (!currentUserLevel ||
                (event.data as LessonDTO).level
                  .map((level) => level.shortName)
                  .includes(currentUserLevel.shortName))
            ) {
              this.updateLessons(event.data as LessonDTO);
            }
            if (
              event.action === 'lessonDeleted' &&
              (!currentUserLevel ||
                (event.data as LessonDTO).level
                  .map((level) => level.shortName)
                  .includes(currentUserLevel.shortName))
            ) {
              this.removeLesson(event.data as LessonDTO);
            }
          }
        );
      }
    }
  }

  getAll(): Observable<LessonDTO[]> {
    return this.httpClient.get<LessonDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load lessons');
      }),
      tap((lessons) => {
        this.sortLessons(lessons);
        this.lessonSubject.next(lessons);
      })
    );
  }

  getAllBySchoolId(currentSchoolId: string): Observable<LessonDTO[]> {
    return this.httpClient
      .get<LessonDTO[]>(`${this.baseUrl}?currentSchoolId=${currentSchoolId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load lessons');
        }),
        tap((lessons) => {
          this.sortLessons(lessons);
          this.lessonSubject.next(lessons);
        })
      );
  }

  sortLessons(lessons: LessonDTO[]): void {
    lessons.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    });
  }

  create(data: CreateLessonDTO[]): Observable<LessonDTO[]> {
    return this.httpClient.post<LessonDTO[]>(`${this.baseUrl}/new`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new lesson');
      })
    );
  }

  update(data: LessonDTO): Observable<LessonDTO> {
    return this.httpClient
      .patch<LessonDTO>(`${this.baseUrl}/update/${data._id}`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to update new lesson');
        })
      );
  }

  joinLesson(lesson: LessonDTO, student: UserDTO): Observable<LessonDTO> {
    return this.httpClient
      .patch<LessonDTO>(`${this.baseUrl}/register/${lesson._id}`, student)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to join lesson');
        })
      );
  }

  joinLessonMultipleStudents(
    lesson: LessonDTO,
    students: UserDTO[]
  ): Observable<LessonDTO> {
    return this.httpClient
      .patch<LessonDTO>(
        `${this.baseUrl}/register-multi/${lesson._id}`,
        students
      )
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to add students to lesson');
        })
      );
  }

  startLesson(lesson: LessonDTO): Observable<LessonDTO> {
    return this.httpClient
      .patch<LessonDTO>(`${this.baseUrl}/start-lesson/${lesson._id}`, lesson)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to join lesson');
        })
      );
  }

  cancelLesson(lesson: LessonDTO, student: UserDTO): Observable<LessonDTO> {
    return this.httpClient
      .patch<LessonDTO>(`${this.baseUrl}/cancel/${lesson._id}`, student)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to cancel lesson');
        })
      );
  }

  delete(data: LessonDTO): Observable<LessonDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<LessonDTO>(`${this.baseUrl}/${data._id}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to delete lesson');
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

  // --- Socket functions:

  private refreshLessons(newLessons: LessonDTO[]): void {
    const currentLessons = this.lessonSubject.value;
    this.lessonSubject.next([...currentLessons, ...newLessons]);
  }

  private updateLessons(updatedLesson: LessonDTO): void {
    const currentLessons = this.lessonSubject.value;
    // eslint-disable-next-line no-confusing-arrow
    const updatedLessons = currentLessons.map((lesson) =>
      lesson._id === updatedLesson._id ? updatedLesson : lesson
    );
    this.lessonSubject.next(updatedLessons);
  }

  private removeLesson(deletedLesson: LessonDTO): void {
    const currentLessons = this.lessonSubject.value;
    const updatedLessons = currentLessons.filter(
      (lesson) => lesson._id !== deletedLesson._id
    );
    this.lessonSubject.next(updatedLessons);
  }
}
