import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  private readonly messageSubject = new BehaviorSubject<MessageDto[]>([]);
  messages$ = this.messageSubject.asObservable();

  private readonly messageGroupSubject = new BehaviorSubject<MessageGroupDto[]>(
    []
  );
  messageGroups$ = this.messageGroupSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  getAllMessages(): Observable<MessageDto[]> {
    return this.httpClient.get<MessageDto[]>(this.baseUrl).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load messages');
      }),
      tap((messages) => {
        this.messageSubject.next(messages);
      })
    );
  }

  getMessagesByUser(userId: string): Observable<MessageDto[]> {
    return this.httpClient
      .get<MessageDto[]>(`${this.baseUrl}?currentUserId=${userId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load messages');
        }),
        tap((messages) => {
          this.messageSubject.next(messages);
        })
      );
  }

  getAllMessageGroups(): Observable<MessageGroupDto[]> {
    return this.httpClient
      .get<MessageGroupDto[]>(`${this.baseUrl}/groups`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load message groups');
        }),
        tap((groups) => {
          this.messageGroupSubject.next(groups);
        })
      );
  }

  getGroupsByUser(userId: string): Observable<MessageGroupDto[]> {
    return this.httpClient
      .get<MessageGroupDto[]>(`${this.baseUrl}/groups?currentUserId=${userId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load message groups');
        }),
        tap((groups) => {
          this.messageGroupSubject.next(groups);
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

export interface CreateMessageDto {
  messageText: string;
  senderId: string;
  recipients?: { userId: string; seenAt?: string }[]; // can be to an individual or a several recepients, hence the array. 'Seen' property will be the date the receiver has seen it, and undefined if unseen. Undefined if part of a chat group convo, as the recipients will come from the group
  deleted: boolean;
  edited: boolean;
  attachment: { url: string; fileName: string } | null;
  chatGroupId?: string; // id of chat group. Undefined if not part of a created group convo
  replies?: CreateMessageDto[];
  parentMessageId?: string;
  savedByIds?: string[]; // array of users who have saved this message as favourtes
}

export interface MessageDto extends CreateMessageDto {
  _id: string; // after a message is created, it will have an id. When creating, it will not have an id
  createdAt: string;
  replies: CreateMessageDto[];
}

export interface CreateMessageGroupDto {
  groupName: string;
  memberIds: { userId: string; lastSeen?: string }[]; // user ids of group memebers. lastSeen will be the most recent date they opened the chat group. THis will determine if they've seen the most recent message sent in this group
}

export interface MessageGroupDto {
  _id: string;
}
