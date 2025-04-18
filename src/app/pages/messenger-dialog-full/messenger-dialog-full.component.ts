/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of, switchMap } from 'rxjs';
import {
  ConversationDto,
  ConversationService,
  CreateConversationDto,
} from 'src/app/services/conversation-service/conversation.service';
import {
  MessageDto,
  MessengerService,
} from 'src/app/services/messenger-service/messenger.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MessengerDialogFullViewComponent } from './messenger-dialog-full-view/messenger-dialog-full-view.component';

@UntilDestroy()
@Component({
  selector: 'app-messenger-dialog-full',
  templateUrl: './messenger-dialog-full.component.html',
  styleUrls: ['./messenger-dialog-full.component.scss'],
})
export class MessengerDialogFullComponent implements OnInit {
  @ViewChild(MessengerDialogFullViewComponent)
  messengerDialogFullViewComponent: MessengerDialogFullViewComponent;

  messages$: Observable<MessageDto[] | null>;
  conversations$: Observable<ConversationDto[] | null>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: UserDTO;
      users: UserDTO[];
      miniDilaogMode: boolean;
    },
    public dialogRef: MatDialogRef<MessengerDialogFullComponent>,
    private readonly messengerService: MessengerService,
    private readonly conversatonService: ConversationService,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.messages$ = this.messengerService.messages$;
    this.conversations$ = this.conversatonService.conversations$;
    this.conversatonService
      .getConversationsByUser(this.data.currentUser._id)
      .pipe(untilDestroyed(this))
      .subscribe({
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  // When a user clicks on a new chat conversation:
  selectChat(chat: ConversationDto): void {
    this.messengerService
      .getMessagesByUser({
        userId: this.data.currentUser._id,
        unreadOnly: false,
        conversationId: chat._id,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          // mark the chat as loaded so we don't load the data again:
          const selectedChat =
            this.messengerDialogFullViewComponent.sideMessageChatList.find(
              (chatItem) => chatItem._id === chat._id
            );
          if (selectedChat) {
            selectedChat.loaded = true;
          }
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  sendMessage(message: {
    messageText: string;
    conversation: CreateConversationDto | ConversationDto;
    recipientIds: string[];
  }): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const conversation$ = (message.conversation as ConversationDto)._id
      ? of(message.conversation) // wrap existing conversation in an observable
      : this.conversatonService.createConversation(message.conversation);

    conversation$
      .pipe(
        switchMap((conversation) => {
          this.messengerDialogFullViewComponent.selectedMessageChat =
            conversation as ConversationDto;

          return this.messengerService.createMessage({
            messageText: message.messageText,
            senderId: this.data.currentUser._id,
            recipients: message.recipientIds
              .filter((recipient) => recipient !== this.data.currentUser._id)
              .map((userId) => ({
                userId,
                seenAt: undefined,
              })),
            deleted: false,
            edited: undefined,
            attachment: null,
            conversationId: (conversation as ConversationDto)._id,
          });
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: () => {
          this.messengerDialogFullViewComponent.scrollToChatBottom();
          this.messengerDialogFullViewComponent.startNewDirectConvoMode = false;

          // clear the message input form and remove user typing status after successfult send:
          setTimeout(() => {
            this.messengerDialogFullViewComponent.messageTextToSend = '';
            this.messengerDialogFullViewComponent.onMessageInputChange();
          });
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  editMessage(message: MessageDto): void {
    this.messengerService
      .editMessage(message)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.snackbarService.open('info', 'Message successfully updated');
          this.messengerDialogFullViewComponent.currentEditMessage = undefined;
        },
      });
  }

  deleteMessage(messageId: string): void {
    this.messengerService
      .deleteMessage(messageId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.snackbarService.open('info', 'Message successfully deleted');
        },
      });
  }

  markAsSeen(messagesToMarkIds: string[]): void {
    this.messengerService
      .markAsSeen({
        messagesToMarkIds,
        currentUserId: this.data.currentUser._id,
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  changeCurrentUserTypingStatus(data: {
    isCurrentUserTyping: boolean;
    conversationId: string;
    currentUserId: string;
  }): void {
    this.conversatonService
      .updateCurrentUserTypingStatus(data)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  openFullMessenger(): void {
    this.dialogRef.close(true);
  }

  closeFormClick(): void {
    this.dialogRef.close();
  }
}
