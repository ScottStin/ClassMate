import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable } from 'rxjs';
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

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: UserDTO;
      users: UserDTO[];
    },
    public dialogRef: MatDialogRef<MessengerDialogFullComponent>,
    private readonly messengerService: MessengerService,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.messages$ = this.messengerService.messages$;
    this.messageGroups$ = this.messengerService.messageGroups$;
    forkJoin([
      this.messengerService.getMessagesByUser(this.data.currentUser._id),
      this.messengerService.getGroupsByUser(this.data.currentUser._id),
    ])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  sendMessage(message: { messageText: string; recipientIds: string[] }): void {
    console.log(message);
    this.messengerService
      .createMessage({
        messageText: message.messageText,
        senderId: this.data.currentUser._id,
        recipients: message.recipientIds
          .filter((recipient) => recipient !== this.data.currentUser._id)
          .map((userId) => ({
            userId,
            seenAt: undefined,
          })),
        deleted: false,
        edited: false,
        attachment: null,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          // clear message from input after successfully sent:
          this.messengerDialogFullViewComponent.messageTextToSend = '';
          this.messengerDialogFullViewComponent.scrollToChatBottom();
          this.messengerDialogFullViewComponent.startNewDirectConvoMode = false;
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  closeFormClick(): void {
    this.dialogRef.close();
  }
}
