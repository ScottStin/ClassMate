import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import {
  ConversationDto,
  ConversationService,
  CreateConversationDto,
} from 'src/app/services/conversation-service/conversation.service';
import {
  MessageDto,
  MessageGroupDto,
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
  messageGroups$: Observable<MessageGroupDto[] | null>;
  conversations$: Observable<ConversationDto[] | null>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: UserDTO;
      users: UserDTO[];
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
    this.messageGroups$ = this.messengerService.messageGroups$;
    this.conversations$ = this.conversatonService.conversations$;

    forkJoin([
      // this.messengerService.getMessagesByUser(this.data.currentUser._id, true),
      this.messengerService.getGroupsByUser(this.data.currentUser._id),
      this.conversatonService.getConversationsByUser(this.data.currentUser._id),
    ])
      .pipe(untilDestroyed(this))
      .subscribe({
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  selectMessageGroup(conversation: ConversationDto): void {
    this.messengerService
      .getMessagesByUser(this.data.currentUser._id, false, conversation._id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          // mark the conversation as loaded so we don't load the data again:
          const selectedConvo =
            this.messengerDialogFullViewComponent.sideMessageListDisplay.find(
              (listItem) => listItem._id === conversation._id
            );
          if (selectedConvo) {
            selectedConvo.loaded = true;
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
          this.messengerDialogFullViewComponent.selectedMessageGroup =
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
          this.messengerDialogFullViewComponent.messageTextToSend = '';
          this.messengerDialogFullViewComponent.onMessageInputChange();
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

  closeFormClick(): void {
    this.dialogRef.close();
  }
}
