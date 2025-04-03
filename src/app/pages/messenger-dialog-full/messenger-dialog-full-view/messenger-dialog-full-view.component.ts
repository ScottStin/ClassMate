import { formatDate } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { MessageDto } from 'src/app/services/messenger-service/messenger.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-messenger-dialog-full-view',
  templateUrl: './messenger-dialog-full-view.component.html',
  styleUrls: ['./messenger-dialog-full-view.component.scss'],
})
export class MessengerDialogFullViewComponent implements OnInit, OnChanges {
  @Input() messages: MessageDto[] | null;
  @Input() users: UserDTO[] | null;

  sideMessageListDisplay: SideMessageType[] = [];
  selectedMessage?: SideMessageType;
  startNewDirectConvoMode = false;
  usersToAddList: UserDTO[] = [];
  filteredUsersToAdd: UserDTO[];
  demoCurrentUserId = '67e5223431c4f5a6cca2880f';

  addUserToDirectConvoForm: FormGroup<{
    addUserToNewDirectConvo: FormControl<string>;
  }>;
  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateForm();
    this.getMessageList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('messages' in changes && this.messages) {
      // sort messages by date created:
      this.messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // get message list for side menu:
      this.getMessageList();
    }

    if ('users' in changes && this.users) {
      this.filteredUsersToAdd = [...this.users];
    }
  }

  populateForm(): void {
    this.addUserToDirectConvoForm = new FormGroup({
      addUserToNewDirectConvo: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
    });

    this.formPopulated.next(true);
  }

  getMessageList(): void {
    if (!this.messages) {
      return;
    }

    const groupedMessages = new Map<
      string,
      {
        title: string;
        messages: MessageDto[];
        chatGroupId?: string;
        participantIds?: string[]; // Add participant IDs
      }
    >();

    for (const msg of this.messages) {
      if (msg.chatGroupId) {
        // Group chat messages
        if (!groupedMessages.has(msg.chatGroupId)) {
          groupedMessages.set(msg.chatGroupId, {
            title: msg.chatGroupId,
            messages: [],
            chatGroupId: msg.chatGroupId,
            participantIds: [], // Initialize array
          });
        }
        groupedMessages.get(msg.chatGroupId)?.messages.push(msg);

        // Add unique participant IDs
        const participantIds = new Set(
          groupedMessages.get(msg.chatGroupId)?.participantIds
        );
        if (msg.sender?._id) {
          participantIds.add(msg.sender._id);
        }
        msg.recipients?.forEach(
          (r) => r.user?._id && participantIds.add(r.user._id)
        );
        groupedMessages.get(msg.chatGroupId)!.participantIds =
          Array.from(participantIds);
      } else {
        // Direct messages
        const participants = [
          { id: msg.sender?._id, name: msg.sender?.name ?? 'Unknown user' },
          ...(msg.recipients?.map((r) => ({
            id: r.user?._id,
            name: r.user?.name ?? 'Unknown user',
          })) || []),
        ];

        // Extract unique participant names & IDs
        const uniqueParticipants = Array.from(
          new Set(participants.map((p) => p.name))
        ).sort();
        const uniqueParticipantIds = Array.from(
          new Set(
            participants.map((p) => p.id).filter((id): id is string => !!id)
          )
        );

        const key = uniqueParticipants.join(',');

        if (!groupedMessages.has(key)) {
          groupedMessages.set(key, {
            title: uniqueParticipants
              .filter((name) => name !== this.demoCurrentUserId)
              .join(', '), // Exclude current user from title
            messages: [],
            participantIds: uniqueParticipantIds, // Store IDs
          });
        }
        groupedMessages.get(key)?.messages.push(msg);
      }
    }

    // Convert to array and sort by most recent message timestamp
    this.sideMessageListDisplay = Array.from(groupedMessages.values()).sort(
      (a, b) =>
        new Date(b.messages[b.messages.length - 1].createdAt).getTime() -
        new Date(a.messages[a.messages.length - 1].createdAt).getTime()
    );

    console.log(this.sideMessageListDisplay);
  }

  selectMessage(sideMessage: SideMessageType): void {
    this.selectedMessage = sideMessage;
  }

  formatMessageTimestamp(timestamp: string): string {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    if (messageDate.toDateString() === today.toDateString()) {
      return formatDate(messageDate, 'shortTime', 'en-US');
    } else if (messageDate > oneWeekAgo) {
      return formatDate(messageDate, 'EEE h:mm a', 'en-US');
    } else {
      return formatDate(messageDate, 'MMM d, yyyy h:mm a', 'en-US');
    }
  }

  /**
   * =================
   * Start new direct conversation:
   * ================
   */
  startNewDirectConversation(): void {
    this.startNewDirectConvoMode = true;
  }

  filterUsersToAddToNewDirectConvo(search: string): void {
    this.filteredUsersToAdd =
      this.users?.filter(
        (obj: UserDTO) =>
          obj.name.toLowerCase().includes(search.toLowerCase()) &&
          !this.usersToAddList.includes(obj)
      ) ?? [];
  }

  updateUsersAddingToDirectConvo(user: UserDTO): void {
    this.usersToAddList.push(user);
    this.usersToAddList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
    this.addUserToDirectConvoForm.get('addUserToNewDirectConvo')?.setValue('');

    // --- see if newly created direct message already exists:
    const userToAddListIds = this.usersToAddList.map(
      (userToAdd) => userToAdd._id
    );

    const matchingSideListItem = this.sideMessageListDisplay.find(
      (item) =>
        item.participantIds?.length === userToAddListIds.length &&
        new Set(item.participantIds).size === new Set(userToAddListIds).size &&
        item.participantIds.every((id) => userToAddListIds.includes(id))
    );

    if (matchingSideListItem) {
      this.selectedMessage = matchingSideListItem;
    } else {
      this.selectedMessage = undefined;
    }
  }

  removeUserFromNewDirectConvo(removedUser: UserDTO): void {
    this.usersToAddList = this.usersToAddList.filter(
      (user) => user !== removedUser
    );
  }
}

export interface SideMessageType {
  title: string;
  messages: MessageDto[];
  participantIds?: string[];
}
