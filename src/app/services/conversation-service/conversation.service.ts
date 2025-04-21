/* eslint-disable no-confusing-arrow */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
import { ProfilePictureDTO, UserDTO } from 'src/app/shared/models/user.model';
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
            if (event.action === 'userTyping') {
              this.updateUserTyping(event.data);
            }
            if (event.action === 'updateGroup') {
              this.updateConvo(event.data, currentUser._id);
            }
            if (event.action === 'deleteGroup') {
              this.deleteConvo(event.data);
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

        // Add most recent message to convo
        return conversations.map((conversation) => {
          const senderId = conversation.mostRecentMessage?.senderId;
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
      );
  }

  updateGroup(conversation: ConversationDto): Observable<ConversationDto> {
    return this.httpClient
      .patch<ConversationDto>(
        `${this.baseUrl}/update-group/${conversation._id}`,
        conversation
      )
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to update conversation');
        })
      );
  }

  updateCurrentUserTypingStatus(data: {
    isCurrentUserTyping: boolean;
    conversationId: string;
    currentUserId: string;
  }): Observable<ConversationDto> {
    return this.httpClient
      .patch<ConversationDto>(
        `${this.baseUrl}/user-typing/${data.conversationId}`,
        data
      )
      .pipe(
        catchError((error: Error) => {
          this.handleError(
            error,
            'Failed to updating conversaiton typing status'
          );
        })
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

      const updatedConversationList = currentConversations.map((convo) =>
        convo._id === conversationToUpdate._id ? conversationToUpdate : convo
      );

      this.conversationSubject.next(updatedConversationList);
    }
  }

  deleteGroup(conversationId: string): Observable<ConversationDto> {
    return this.httpClient
      .delete<ConversationDto>(`${this.baseUrl}/delete-group/${conversationId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to delete group');
        })
      );
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }

    throw this.errorService.handleGenericError(error, message);
  }

  /**
   *  ===================
   * Socket IO Funcitons:
   *  ===================
   */

  private newConvoInitiated(newConvo: ConversationDto): void {
    const currentConversations = this.conversationSubject.getValue();
    this.conversationSubject.next([...currentConversations, newConvo]);
  }

  private updateConvo(
    modifiedConvo: ConversationDto,
    currentUserId: string
  ): void {
    // Get list of current convos:
    const currentConversations = this.conversationSubject.getValue();

    // add user name to most recent message:
    const users = this.userService.userSubject.getValue();
    if (modifiedConvo.mostRecentMessage) {
      modifiedConvo.mostRecentMessage.senderName = users.find(
        (user) => user._id === modifiedConvo.mostRecentMessage?.senderId
      )?.name;
    }

    // create new convo list with original convos and modified convo:
    let updatedConvoList = currentConversations.map((currentConvo) =>
      currentConvo._id === modifiedConvo._id ? modifiedConvo : currentConvo
    );

    // if user has been added to a convo, handle accordingly:
    if (
      modifiedConvo.participantIds.includes(currentUserId) &&
      !updatedConvoList.map((convo) => convo._id).includes(modifiedConvo._id)
    ) {
      updatedConvoList.push(modifiedConvo);
    }

    // if user has been removed from a convo, handle accordingly:
    if (
      !modifiedConvo.participantIds.includes(currentUserId) &&
      updatedConvoList.map((convo) => convo._id).includes(modifiedConvo._id)
    ) {
      updatedConvoList = updatedConvoList.filter(
        (convo) => convo._id !== modifiedConvo._id
      );
    }

    // update obseravbles:
    this.conversationSubject.next(updatedConvoList);
  }

  private updateUserTyping(modifiedConvo: ConversationDto): void {
    // Get list of current convos:
    const currentConversations = this.conversationSubject.getValue();

    // add most recent message to modified convo:
    const convoToBeReplaced = currentConversations.find(
      (convo) => convo._id === modifiedConvo._id
    );
    modifiedConvo.mostRecentMessage = convoToBeReplaced?.mostRecentMessage;

    // create new convo list with original convos and modified convo:
    const updatedConvoList = currentConversations.map((currentConvo) =>
      currentConvo._id === modifiedConvo._id ? modifiedConvo : currentConvo
    );

    // update obseravbles:
    this.conversationSubject.next(updatedConvoList);
  }

  private deleteConvo(deletedConvo: ConversationDto): void {
    // Get list of current convos:
    let currentConversations = this.conversationSubject.getValue();

    // remove delete convo:
    currentConversations = currentConversations.filter(
      (convo) => convo._id !== deletedConvo._id
    );

    // update obseravbles:
    this.conversationSubject.next(currentConversations);
  }
}

// todo - move to entity folder
export interface CreateConversationDto {
  participantIds: string[];
  // title: string;
  unreadMessageForCurrentUser?: boolean;
  usersTyping?: string[]; // id of typing user
  mostRecentMessage?: {
    senderId?: string;
    messageText?: string;
    createdAt?: string;
    senderName?: string;
  };
  messages?: MessageDto[];
  loaded?: boolean; // this will eventually be replaced with the number/date range of messages loaded to prevent loading all messages at once

  // properties for creating groups:
  groupName?: string;
  image?: ProfilePictureDTO | null;
  schoolId?: string;
  groupAdminId?: string; // id of person who created group
  groupAdminName?: string; // name of person who created group
}

export interface ConversationDto extends CreateConversationDto {
  _id: string;
}
