import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  Observable,
  scan,
  tap,
  withLatestFrom,
} from 'rxjs';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';
import { UserService } from '../user-service/user.service';

@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  private readonly messageSubject = new BehaviorSubject<MessageDto[]>([]);

  // newMessages$: Observable<MessageDto> = this.createMessage(...);
  // messages$: Observable<MessageDto[]> = merge(
  //   this.getMessagesByUser('67e5223431c4f5a6cca2880f'), // Initial messages
  //   this.newMessages$ // Newly created messages
  // ).pipe(
  //   scan((acc, curr) => [...acc, curr], []) // Accumulate messages over time
  // );

  messages$ = this.messageSubject.asObservable();

  private readonly messageGroupSubject = new BehaviorSubject<MessageGroupDto[]>(
    []
  );
  messageGroups$ = this.messageGroupSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly userService: UserService
  ) {}

  getAllMessages(): Observable<MessageDto[]> {
    return combineLatest([
      this.userService.users$,
      this.httpClient.get<MessageDto[]>(this.baseUrl),
    ]).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load messages');
      }),
      map(([users, messages]) => {
        const userMap = new Map(users.map((user) => [user._id, user]));

        return messages.map((message) => ({
          ...message,
          sender: userMap.get(message.senderId) ?? undefined, // Use null instead of 'Unknown'
          recipients: message.recipients?.map((recipient) => ({
            ...recipient,
            user: userMap.get(recipient.userId) ?? undefined,
          })),
        }));
      }),
      tap((updatedMessages) => {
        this.messageSubject.next(updatedMessages);
      })
    );
  }

  getMessagesByUser(userId: string): Observable<MessageDto[]> {
    return combineLatest([
      this.userService.users$,
      this.httpClient.get<MessageDto[]>(
        `${this.baseUrl}?currentUserId=${userId}`
      ),
    ]).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load messages');
      }),
      map(([users, messages]) => {
        const userMap = new Map(users.map((user) => [user._id, user]));

        return messages.map((message) => ({
          ...message,
          sender: userMap.get(message.senderId) ?? undefined, // Use null instead of 'Unknown'
          recipients: message.recipients?.map((recipient) => ({
            ...recipient,
            user: userMap.get(recipient.userId) ?? undefined,
          })),
        }));
      }),
      tap((updatedMessages) => {
        this.messageSubject.next(updatedMessages);
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

  createMessage(message: CreateMessageDto): Observable<MessageDto> {
    return this.httpClient
      .post<MessageDto>(`${this.baseUrl}/new-message`, message)
      .pipe(
        withLatestFrom(this.userService.users$),
        tap(([newMessage, users]) => {
          const currentMessages = this.messageSubject.getValue();

          // Find sender
          const sender = users.find((user) => user._id === newMessage.senderId);
          newMessage.sender = sender;

          // Find recipients
          newMessage.recipients = newMessage.recipients?.map((recipient) => ({
            ...recipient,
            user: users.find((user) => user._id === recipient.userId),
          }));

          console.log('HIITT');
          console.log(newMessage);
          console.log(currentMessages);
          // Update the message subject
          this.messageSubject.next([...currentMessages, newMessage]);
        }),
        map(([newMessage]) => newMessage),
        catchError((error: Error) => {
          this.handleError(error, 'Failed to send new message');
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
  sender?: UserDTO;
  recipients?: { userId: string; seenAt?: string; user?: UserDTO }[]; // can be to an individual or a several recepients, hence the array. 'Seen' property will be the date the receiver has seen it, and undefined if unseen. Undefined if part of a chat group convo, as the recipients will come from the group
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
