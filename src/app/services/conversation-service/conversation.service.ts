import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  tap,
} from 'rxjs';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';
import { MessageDto } from '../messenger-service/messenger.service';
import { UserService } from '../user-service/user.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly baseUrl = `${environment.apiUrl}/conversations`;

  private readonly conversationSubject = new BehaviorSubject<ConversationDto[]>(
    []
  );
  conversations$ = this.conversationSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly userService: UserService,
    private readonly socket: Socket
  ) {
    const currentUserString = localStorage.getItem('current_user');

    if (currentUserString !== null) {
      const currentUser = JSON.parse(currentUserString) as UserDTO | undefined;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (currentUser?._id) {
        this.socket.on(
          `conversationEvent-${currentUser._id}`,
          (event: { data: ConversationDto; action: string }) => {
            if (event.action === 'newConversation') {
              this.newConvoInitiated(event.data);
            }
          }
        );
      }
    }
  }

  getConversationsByUser(userId: string): Observable<ConversationDto[]> {
    return combineLatest([
      this.userService.users$,
      this.httpClient.get<ConversationDto[]>(
        `${this.baseUrl}?currentUserId=${userId}`
      ),
    ]).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load conversations');
      }),
      map(([users, conversations]) => {
        const userMap = new Map(users.map((user) => [user._id, user]));

        return conversations.map((conversation) => {
          const senderId = conversation.mostRecentMessage?.senderId;
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          const senderName = senderId ? userMap.get(senderId)?.name : undefined;

          return {
            ...conversation,
            mostRecentMessage: {
              ...conversation.mostRecentMessage,
              senderName,
            },
          };
        });
      }),
      tap((updatedConversations) => {
        this.conversationSubject.next(updatedConversations);
      })
    );
  }

  createConversation(
    conversation: CreateConversationDto
  ): Observable<ConversationDto> {
    return this.httpClient
      .post<ConversationDto>(`${this.baseUrl}`, conversation)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to create new conversation');
        })
        // tap((newConversation) => {
        //   const currentConversations = this.conversationSubject.getValue();
        //   this.conversationSubject.next([
        //     ...currentConversations,
        //     newConversation,
        //   ]);
        // })
      );
  }

  updateMostRecentConversationMessage(message: MessageDto): void {
    const currentConversations = this.conversationSubject.getValue();
    const conversationToUpdate = currentConversations.find(
      (convo) => convo._id === message.conversationId
    );

    if (conversationToUpdate) {
      conversationToUpdate.mostRecentMessage = {
        createdAt: message.createdAt,
        messageText: message.messageText,
        senderId: message.senderId,
        senderName: message.sender?.name,
      };

      // eslint-disable-next-line no-confusing-arrow
      const updatedConversationList = currentConversations.map((convo) =>
        convo._id === conversationToUpdate._id ? conversationToUpdate : convo
      );

      this.conversationSubject.next(updatedConversationList);
    }
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
  private newConvoInitiated(newConvo: ConversationDto): void {
    const currentConversations = this.conversationSubject.getValue();
    this.conversationSubject.next([...currentConversations, newConvo]);
  }
}

export interface CreateConversationDto {
  participantIds: string[];
  // title: string;
  unreadMessageForCurrentUser?: boolean;
  userTyping: string | undefined; // id of typing user
  mostRecentMessage?: {
    senderId?: string;
    messageText?: string;
    createdAt?: string;
    senderName?: string;
  };
  messages?: MessageDto[];
  loaded?: boolean; // this will eventually be replaced with the number/date range of messages loaded to prevent loading all messages at once
}

export interface ConversationDto extends CreateConversationDto {
  _id: string;
}
