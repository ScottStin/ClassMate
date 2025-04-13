import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { MessageDto } from 'src/app/services/messenger-service/messenger.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-messenger-dialog-full-view',
  templateUrl: './messenger-dialog-full-view.component.html',
  styleUrls: ['./messenger-dialog-full-view.component.scss'],
})
export class MessengerDialogFullViewComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @ViewChild('chatMessagesContainer') chatMessagesContainer: ElementRef;

  @Input() messages: MessageDto[] | null;
  @Input() users: UserDTO[] | null;
  @Input() currentUser: UserDTO;
  @Output() sendMessage = new EventEmitter<{
    messageText: string;
    recipientIds: string[];
  }>();
  @Output() editMessage = new EventEmitter<MessageDto>();
  @Output() deleteMessage = new EventEmitter<string>();
  @Output() markAsSeen = new EventEmitter<string[]>();

  sideMessageListDisplay: SideMessageType[] = [];
  selectedMessageGroup?: SideMessageType;
  startNewDirectConvoMode = false;
  usersToAddList: UserDTO[] = [];
  filteredUsersToAdd: UserDTO[];
  messageTextToSend = '';
  currentEditMessage?: string; // id of mesage currently being editted

  addUserToDirectConvoForm: FormGroup<{
    addUserToNewDirectConvo: FormControl<string>;
  }>;
  formPopulated = new Subject<boolean>();

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.populateForm();
    this.getMessageList();
  }

  ngAfterViewInit(): void {
    this.scrollToChatBottom();
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

      // check if there are any unseen mesages:
      this.checkUnseenMessagesInMessageGroup();
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

  scrollToChatBottom(): void {
    if (this.chatMessagesContainer) {
      this.chatMessagesContainer.nativeElement.scrollTop =
        this.chatMessagesContainer.nativeElement.scrollHeight;
    }
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
        hasUnseenMessagesForCurrentUser: false;
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
            hasUnseenMessagesForCurrentUser: false,
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
          // If only the current user is in the chat, set the title to 'Yourself'
          let title = uniqueParticipants
            .filter((name) => name !== this.currentUser.name)
            .join(', '); // Exclude current user from title

          if (
            uniqueParticipants.length === 1 &&
            uniqueParticipants.includes(this.currentUser.name)
          ) {
            title = `${this.currentUser.name} (private chat with yourself)`; // Single participant - set title as "Yourself"
          }

          groupedMessages.set(key, {
            title,
            messages: [],
            participantIds: uniqueParticipantIds, // Store IDs
            hasUnseenMessagesForCurrentUser: false,
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

    // If user hasn't started a direct convo with themselves, add it to the top of the list:
    if (
      this.sideMessageListDisplay.filter(
        (messageGroup) =>
          !messageGroup.participantIds?.includes(this.currentUser._id)
      )
    ) {
      this.sideMessageListDisplay.push({
        title: `${this.currentUser.name} (private chat with yourself)`,
        messages: [],
        participantIds: [this.currentUser._id],
        hasUnseenMessagesForCurrentUser: false,
      });
    }

    // If there is already a selectedMessageGroup, update the messages in it:
    if (this.selectedMessageGroup) {
      this.selectedMessageGroup = this.sideMessageListDisplay.find(
        (messageGroup) =>
          messageGroup.title === this.selectedMessageGroup?.title
      );
      setTimeout(() => {
        this.scrollToChatBottom();
      });
    }
  }

  selectMessage(sideMessage: SideMessageType): void {
    this.selectedMessageGroup = sideMessage;
    this.removeAllUsersFromNewDirectConvo();
    this.startNewDirectConvoMode = false;

    setTimeout(() => {
      this.scrollToChatBottom();
    });

    // Mark all as seen:
    const unseenMessages = this.selectedMessageGroup.messages
      .filter(
        (message) =>
          message.recipients?.some(
            (recipient) =>
              recipient.userId === this.currentUser._id &&
              recipient.seenAt === undefined
          )
      )
      .map((unseenMessge) => unseenMessge._id);

    if (unseenMessages.length > 0) {
      this.markAsSeen.emit(unseenMessages);
    }
    this.selectedMessageGroup.hasUnseenMessagesForCurrentUser = false;
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

  checkUnseenMessagesInMessageGroup(): void {
    const currentUserId = this.currentUser._id;

    this.sideMessageListDisplay.forEach((group) => {
      const hasUnseenMessage = group.messages.some(
        (message) =>
          message.recipients?.some(
            (recipient) =>
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              recipient.userId === currentUserId && !recipient.seenAt
          )
      );

      group.hasUnseenMessagesForCurrentUser = hasUnseenMessage;
    });
  }

  getLatestMessagefromSideList(messageListItem?: SideMessageType): string {
    console.log(messageListItem);
    if (messageListItem) {
      const latestMessage =
        messageListItem.messages[messageListItem.messages.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
      if (latestMessage) {
        let senderName = 'Latest messsage';
        if (
          messageListItem.participantIds &&
          messageListItem.participantIds.length > 2
        ) {
          senderName =
            (latestMessage.sender?._id === this.currentUser._id
              ? 'You'
              : latestMessage.sender?.name) ?? 'Latest messsage';
        }
        return `${senderName}: ${latestMessage.messageText}`;
      }
    }
    return '';
  }

  /**
   * ===========================
   * Start new direct conversation:
   * ============================
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
    this.checkExistingDirectConversation();
  }

  // --- see if direct message conversation we're creating already exists:
  checkExistingDirectConversation(): void {
    const userToAddListIds = this.usersToAddList.map(
      (userToAdd) => userToAdd._id
    );

    const matchingSideListItem = this.sideMessageListDisplay.find(
      (item) =>
        item.participantIds?.filter((id) => id !== this.currentUser._id)
          .length === userToAddListIds.length &&
        new Set(item.participantIds.filter((id) => id !== this.currentUser._id))
          .size === new Set(userToAddListIds).size &&
        item.participantIds
          .filter((id) => id !== this.currentUser._id)
          .every((id) => userToAddListIds.includes(id))
    );

    // --- If newly creted direct conversation already exists, open the existing chat:
    if (matchingSideListItem) {
      this.selectedMessageGroup = matchingSideListItem;
    } else {
      this.selectedMessageGroup = undefined;
    }
  }

  removeUserFromNewDirectConvo(removedUser: UserDTO): void {
    this.usersToAddList = this.usersToAddList.filter(
      (user) => user !== removedUser
    );

    this.checkExistingDirectConversation();
  }

  removeAllUsersFromNewDirectConvo(): void {
    this.usersToAddList = [];
  }

  /**
   * ===========================
   * Message CRUD Clicks:
   * ============================
   */
  sendMessageClick(): void {
    this.sendMessage.emit({
      messageText: this.messageTextToSend,
      recipientIds:
        this.selectedMessageGroup?.participantIds ??
        this.usersToAddList.map((user) => user._id),
    });
  }

  editMessageClick(message: MessageDto, editedText: string): void {
    message.messageText = editedText;
    this.editMessage.emit(message);
  }

  deleteMessageClick(message: MessageDto): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete message?`,
        message: `The following message will be deleted: <br><br> &nbsp; &nbsp; <i>${message.messageText}</i> <br><br> Once deleted, other chat participants will be able to see that you've sent a message, but they won't be able to see the message content.`,
        okLabel: `Delete`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteMessage.emit(message._id);
      }
    });
  }
}

export interface SideMessageType {
  title: string;
  messages: MessageDto[];
  participantIds?: string[];
  hasUnseenMessagesForCurrentUser: boolean;
}
