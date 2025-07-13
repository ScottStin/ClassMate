import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import {
  CreateNotificationDTO,
  NotificationDTO,
} from 'src/app/shared/models/notification.mode';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private readonly notificationSubject = new BehaviorSubject<NotificationDTO[]>(
    []
  );
  notifications$ = this.notificationSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly socket: Socket
  ) {
    const currentUserString = localStorage.getItem('current_user');

    if (currentUserString !== null) {
      const currentUser = JSON.parse(currentUserString) as UserDTO | undefined;

      if (currentUser?._id) {
        this.socket.on(
          `notificationCreated-${currentUser._id}`,
          (newNotification: NotificationDTO) => {
            this.refreshNotifications(newNotification);
          }
        );
      }
    }
  }

  getAllByUserId(currentUserId: string): Observable<NotificationDTO[]> {
    return this.httpClient
      .get<NotificationDTO[]>(`${this.baseUrl}?currentUserId=${currentUserId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load notifications');
        }),
        tap((notifications) => {
          this.sortNotifications(notifications);
          this.notificationSubject.next(notifications);
        })
      );
  }

  sortNotifications(lessons: NotificationDTO[]): void {
    lessons.sort((b, a) => {
      const dateA = new Date(a.dateSent);
      const dateB = new Date(b.dateSent);
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    });
  }

  create(data: CreateNotificationDTO): Observable<NotificationDTO> {
    return this.httpClient
      .post<NotificationDTO>(`${this.baseUrl}/new`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to create new notification');
        })
      );
  }

  markAllAsSeen(data: {
    notifications: NotificationDTO[];
    currentUserId: string;
  }): Observable<NotificationDTO[]> {
    return this.httpClient
      .post<NotificationDTO[]>(`${this.baseUrl}/mark-as-seen`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to mark notification as seen');
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
  private refreshNotifications(newNotification: NotificationDTO): void {
    const currentNotifications = this.notificationSubject.value;
    this.notificationSubject.next([...currentNotifications, newNotification]);
  }
}

// todo:

// Lesson is ready to start (for teacher)
// A student has completed an exam, please mark
// Teacher has marked your exam
// You have been enrolled in a course
// You have been removed from a course
// Your homework is due today!

// done:

// Lesson has started (for student)
// Student has joined your lesson
// Student has dropped out of your lesson
// Teacher has removed you from a lesson
// A lesson you're enrolled in has be cancelled
// Student has completed homework item, please provide feedvack
// Teacher has provided feedback on your homework
// Teacher has added you to a lesson
// User level updated
