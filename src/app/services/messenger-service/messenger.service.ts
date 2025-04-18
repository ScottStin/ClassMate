import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Socket } from 'ngx-socket-io';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  // merge,
  Observable,
  // scan,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ConversationService } from '../conversation-service/conversation.service';
import { ErrorService } from '../error-message.service/error-message.service';
import { UserService } from '../user-service/user.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  private readonly messageSubject = new BehaviorSubject<MessageDto[]>([]);
  messages$ = this.messageSubject.asObservable();

  // newMessages$: Observable<MessageDto> = this.createMessage(...);
  // messages$: Observable<MessageDto[]> = merge(
  //   this.getMessagesByUser('67e5223431c4f5a6cca2880f'), // Initial messages
  //   this.newMessages$ // Newly created messages
  // ).pipe(
  //   scan((acc, curr) => [...acc, curr], []) // Accumulate messages over time
  // );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly userService: UserService,
    private readonly socket: Socket,
    private readonly conversationService: ConversationService
  ) {
    const currentUserString = localStorage.getItem('current_user');

    if (currentUserString !== null) {
      const currentUser = JSON.parse(currentUserString) as UserDTO | undefined;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (currentUser?._id) {
        this.socket.on(
          `messageEvent-${currentUser._id}`,
          (event: { data: MessageDto; action: string }) => {
            if (event.action === 'messageSent') {
              this.newMessageReceieved(event.data);
            }
            if (event.action === 'messageUpdated') {
              this.updateMessages(event.data);
            }
            if (event.action === 'messageDeleted') {
              this.updateMessages(event.data);
            }
          }
        );
      }
    }
  }

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

  getMessagesByUser(data: {
    userId: string;
    unreadOnly: boolean;
    conversationId?: string;
  }): Observable<MessageDto[]> {
    return combineLatest([
      this.userService.users$,
      this.httpClient.get<MessageDto[]>(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${this.baseUrl}?currentUserId=${data.userId}&unreadOnly=${data.unreadOnly}&conversationId=${data.conversationId}`
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
        const currentMessages = this.messageSubject.getValue();
        const mergedMessages = [
          ...currentMessages.filter(
            (msg) => !updatedMessages.some((updated) => updated._id === msg._id)
          ),
          ...updatedMessages,
        ];
        this.messageSubject.next(mergedMessages);
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

          const modifiedNewMessage = this.modifyNewMessage(newMessage, users);
          this.messageSubject.next([...currentMessages, modifiedNewMessage]);

          // Update conversations:
          this.conversationService.updateMostRecentConversationMessage(
            modifiedNewMessage
          );
        }),
        map(([modifiedNewMessage]) => modifiedNewMessage),
        catchError((error: Error) => {
          this.handleError(error, 'Failed to send new message');
        })
      );
  }

  editMessage(message: MessageDto): Observable<MessageDto> {
    return this.httpClient
      .patch<MessageDto>(`${this.baseUrl}/${message._id}`, message)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to edit message');
        })
      );
  }

  markAsSeen(data: {
    messagesToMarkIds: string[];
    currentUserId: string;
  }): Observable<MessageDto[]> {
    return this.httpClient
      .patch<MessageDto[]>(`${this.baseUrl}/mark-as-seen`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to mark messages as seen');
        })
      );
  }

  deleteMessage(messageId: string): Observable<MessageDto> {
    return this.httpClient
      .delete<MessageDto>(`${this.baseUrl}/${messageId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to delete message');
        })
      );
  }

  /**
   * This function gets the full user details from message sender/recipient ids and adds it to the message
   */
  private modifyNewMessage(message: MessageDto, users: UserDTO[]): MessageDto {
    const enrichedMessage: MessageDto = {
      ...message,
      sender: users.find((user) => user._id === message.senderId),
      recipients: message.recipients?.map((recipient) => ({
        ...recipient,
        user: users.find((user) => user._id === recipient.userId),
      })),
    };

    return enrichedMessage;
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }

    throw this.errorService.handleGenericError(error, message);
  }

  /**
   * Socket IO Funcitons:
   */
  private newMessageReceieved(newMessage: MessageDto): void {
    this.userService.users$
      .pipe(take(1), untilDestroyed(this))
      .subscribe((users) => {
        const modifiedNewMessage = this.modifyNewMessage(newMessage, users);
        const currentMessages = this.messageSubject.getValue();
        this.messageSubject.next([...currentMessages, modifiedNewMessage]);

        // Update conversations:
        this.conversationService.updateMostRecentConversationMessage(
          modifiedNewMessage
        );
      });
  }

  private updateMessages(updatedMessage: MessageDto): void {
    this.userService.users$
      .pipe(take(1), untilDestroyed(this))
      .subscribe((users) => {
        const modifiedNewMessage = this.modifyNewMessage(updatedMessage, users);
        const currentMessages = this.messageSubject.getValue();
        // eslint-disable-next-line no-confusing-arrow
        const updatedMessageList = currentMessages.map((message) =>
          message._id === modifiedNewMessage._id ? modifiedNewMessage : message
        );

        this.messageSubject.next(updatedMessageList);
      });
  }
}

export interface CreateMessageDto {
  messageText: string;
  senderId: string;
  sender?: UserDTO;
  recipients?: { userId: string; seenAt?: string; user?: UserDTO }[]; // can be to an individual or a several recepients, hence the array. 'Seen' property will be the date the receiver has seen it, and undefined if unseen. Undefined if part of a chat group convo, as the recipients will come from the group
  deleted: boolean;
  edited?: string;
  attachment: { url: string; fileName: string } | null;
  chatGroupId?: string; // id of chat group. Undefined if not part of a created group convo
  replies?: CreateMessageDto[];
  parentMessageId?: string;
  savedByIds?: string[]; // array of users who have saved this message as favourtes
  conversationId: string | undefined;
}

export interface MessageDto extends CreateMessageDto {
  _id: string; // after a message is created, it will have an id. When creating, it will not have an id
  createdAt: string;
  replies: CreateMessageDto[];
}
