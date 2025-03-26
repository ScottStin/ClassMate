import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import {
  MessageDto,
  MessageGroupDto,
  MessengerService,
} from 'src/app/services/messenger-service/messenger.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-messenger-dialog-full',
  templateUrl: './messenger-dialog-full.component.html',
  styleUrls: ['./messenger-dialog-full.component.scss'],
})
export class MessengerDialogFullComponent implements OnInit {
  messages$: Observable<MessageDto[] | null>;
  messageGroups$: Observable<MessageGroupDto[] | null>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: UserDTO;
    },
    public dialogRef: MatDialogRef<MessengerDialogFullComponent>,
    private readonly messengerService: MessengerService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.messages$ = this.messengerService.messages$;
    this.messageGroups$ = this.messengerService.messageGroups$;
    forkJoin([
      this.messengerService.getMessagesByUser('user1'),
      this.messengerService.getGroupsByUser('user1'),
    ]).subscribe();
  }

  closeFormClick(): void {
    this.dialogRef.close();
  }
}
