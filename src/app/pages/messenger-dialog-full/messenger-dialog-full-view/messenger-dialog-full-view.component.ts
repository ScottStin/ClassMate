/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import {
  ConversationDto,
  CreateConversationDto,
} from 'src/app/services/conversation-service/conversation.service';
import { MessageDto } from 'src/app/services/messenger-service/messenger.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-messenger-dialog-full-view',
  templateUrl: './messenger-dialog-full-view.component.html',
  styleUrls: ['./messenger-dialog-full-view.component.scss'],
})
export class MessengerDialogFullViewComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('chatMessagesContainer') chatMessagesContainer?: ElementRef;

  @Input() messages: MessageDto[] | null;
  @Input() conversations: ConversationDto[] | null;
  @Input() users: UserDTO[] | null;
  @Input() currentUser: UserDTO;
  @Output() sendMessage = new EventEmitter<{
    messageText: string;
    recipientIds: string[];
    conversation: CreateConversationDto | ConversationDto;
  }>();
  @Output() editMessage = new EventEmitter<MessageDto>();
  @Output() deleteMessage = new EventEmitter<string>();
  @Output() selectMessageGroup = new EventEmitter<ConversationDto>();
  @Output() markAsSeen = new EventEmitter<string[]>();
  @Output() changeCurrentUserTypingStatus = new EventEmitter<{
    isCurrentUserTyping: boolean;
    conversationId: string;
    currentUserId: string;
  }>();

  sideMessageListDisplay: ConversationDto[] = []; // SideMessageType[] = [];
  selectedMessageGroup?: ConversationDto;
  startNewDirectConvoMode = false;
  usersToAddList: UserDTO[] = [];
  filteredUsersToAdd: UserDTO[];
  messageTextToSend = '';
  currentEditMessage?: string; // id of mesage currently being editted
  currentUserTyping = false;

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
      this.filteredUsersToAdd = [
        ...this.users.filter((user) => user._id !== this.currentUser._id),
      ];
    }

    if (
      'conversations' in changes &&
      this.conversations &&
      this.conversations.length > 0
    ) {
      this.getMessageList();
    }
  }

  /*
   * Initiate mat autofill form used for creating new convo:
   */
  populateForm(): void {
    this.addUserToDirectConvoForm = new FormGroup({
      addUserToNewDirectConvo: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
    });

    this.formPopulated.next(true);
  }

  /*
   * When a new message is receieved or new chat is open, ensure we are scrolled to the bottom of the chat window:
   */
  scrollToChatBottom(): void {
    if (this.chatMessagesContainer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, prettier/prettier
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    }
  }

  /*
   * Get the conversation/group lists on the left side of the messenger page, Get the messages for a selected group, and sort messages
   */
  getMessageList(): void {
    // Display conversation on left-side list:
    if (this.conversations) {
      this.sideMessageListDisplay = this.conversations; // todo - add groups to this as well.
    }

    // If message is selected: display messages on right-side message list:
    if (this.selectedMessageGroup) {
      this.selectedMessageGroup =
        this.sideMessageListDisplay.find(
          (sideMessage) => sideMessage._id === this.selectedMessageGroup?._id
        ) ?? this.selectedMessageGroup;

      this.selectedMessageGroup.messages = this.messages?.filter(
        (message) => message.conversationId === this.selectedMessageGroup?._id
      );
    }

    // Sort left-side conversation list by most recent message timestamp:
    this.sideMessageListDisplay = this.sideMessageListDisplay.sort((a, b) => {
      const dateA = a.mostRecentMessage?.createdAt
        ? new Date(a.mostRecentMessage.createdAt).getTime()
        : 0;
      const dateB = b.mostRecentMessage?.createdAt
        ? new Date(b.mostRecentMessage.createdAt).getTime()
        : 0;
      return dateB - dateA; // newest date first
    });

    // // Add current user's personal convo to conversation list:
    // this.sideMessageListDisplay.push({
    //   _id: this.currentUser._id,
    //   messages: [],
    //   participantIds: [this.currentUser._id],
    //   unreadMessageForCurrentUser: false,
    //   userTyping: undefined,
    // });

    setTimeout(() => {
      this.scrollToChatBottom();
    });
  }

  /*
   * When a user clicks on a message group/conversation
   */
  selectMessageGroupClick(sideMessage: ConversationDto): void {
    this.messageTextToSend = '';

    // Change current user typing status to false:
    this.onMessageInputChange();

    // select new convo:
    this.selectedMessageGroup = sideMessage;
    this.removeAllUsersFromNewDirectConvo();
    this.startNewDirectConvoMode = false;

    // if this is the first time opening this message group/convo, load the messages:
    if (!this.selectedMessageGroup.loaded) {
      this.selectMessageGroup.emit(sideMessage);
    }

    this.selectedMessageGroup.messages = this.messages?.filter(
      (message) => message.conversationId === this.selectedMessageGroup?._id
    );

    setTimeout(() => {
      this.scrollToChatBottom();
    });

    // --- Mark all as seen:
    const unseenMessages = this.selectedMessageGroup.messages
      ?.filter(
        (message) =>
          message.recipients?.some(
            (recipient) =>
              recipient.userId === this.currentUser._id &&
              recipient.seenAt === undefined
          )
      )
      .map((unseenMessge) => unseenMessge._id);

    if (unseenMessages && unseenMessages.length > 0) {
      this.markAsSeen.emit(unseenMessages);
    }
    this.selectedMessageGroup.unreadMessageForCurrentUser = false;
  }

  /*
   * Get title for conversation groups:
   */
  getConversationTitle(sideMessageGroup: ConversationDto): string {
    // if (sideMessageGroup._id === this.currentUser._id) {
    //   return 'Private conversation with yourself';
    // }

    return sideMessageGroup.participantIds
      .filter((participantId) => participantId !== this.currentUser._id)
      .map((participantId) => {
        const user = this.users?.find((u) => u._id === participantId);
        return user ? user.name : 'Unknown';
      })
      .join(', ');
  }

  /*
   * Get timestamp for message:
   */
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

  /*
   * When a new message is receieved, check if a conversation of message group has unseen messages:
   */
  checkUnseenMessagesInMessageGroup(): void {
    const currentUserId = this.currentUser._id;
    this.sideMessageListDisplay.forEach((group) => {
      const messagesForGroup = this.messages?.filter(
        (message) => message.conversationId === group._id
      );
      const hasUnseenMessage = messagesForGroup?.some(
        (message) =>
          message.recipients?.some(
            (recipient) =>
              recipient.userId === currentUserId && !recipient.seenAt
          )
      );
      // Only mark group with unseen messages if the group isn't currently open
      if (group !== this.selectedMessageGroup) {
        group.unreadMessageForCurrentUser = hasUnseenMessage;
      } else {
        // if group is currently open, mark the new messages as read:
        const unseenMessages = messagesForGroup?.filter(
          (message) =>
            message.recipients?.some(
              (recipient) =>
                recipient.userId === currentUserId && !recipient.seenAt
            )
        );
        this.markAsSeen.emit(
          unseenMessages?.map((unseenMessage) => unseenMessage._id)
        );
      }
    });
  }

  /**
   * Get a list of users who are currenlying typing in the selected convo
   */
  getUsersTyping(): UserDTO[] {
    if (!this.selectedMessageGroup || !this.users) {
      return [];
    }

    return this.users.filter(
      (user) =>
        this.selectedMessageGroup?.usersTyping?.includes(user._id) &&
        user._id !== this.currentUser._id
    );
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
        (user: UserDTO) =>
          user.name.toLowerCase().includes(search.toLowerCase()) &&
          !this.usersToAddList.includes(user) &&
          user._id !== this.currentUser._id
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
        item.participantIds.filter((id) => id !== this.currentUser._id)
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
      this.selectMessageGroup.emit(matchingSideListItem);
      this.selectedMessageGroup.messages = this.messages?.filter(
        (message) => message.conversationId === this.selectedMessageGroup?._id
      );
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
    let conversation: CreateConversationDto | undefined;
    if (this.startNewDirectConvoMode) {
      conversation = {
        participantIds: [
          ...this.usersToAddList.map((user) => user._id),
          this.currentUser._id,
        ],
        unreadMessageForCurrentUser: true,
        usersTyping: undefined,
      };
    } else {
      conversation = this.selectedMessageGroup;
    }
    if (conversation) {
      this.sendMessage.emit({
        messageText: this.messageTextToSend,
        conversation,
        recipientIds:
          this.selectedMessageGroup?.participantIds ??
          this.usersToAddList.map((user) => user._id),
      });
    }
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

  /**
   * Current User Typing:
   */
  onMessageInputChange(): void {
    const emit = (): void => {
      if (this.selectedMessageGroup) {
        this.changeCurrentUserTypingStatus.emit({
          isCurrentUserTyping: this.currentUserTyping,
          conversationId: this.selectedMessageGroup._id,
          currentUserId: this.currentUser._id,
        });
      }
    };

    if (
      this.messageTextToSend &&
      this.messageTextToSend.trim().length > 0 &&
      !this.currentUserTyping
    ) {
      this.currentUserTyping = true;
      emit();
    }
    if (this.messageTextToSend.trim().length === 0 && this.currentUserTyping) {
      this.currentUserTyping = false;
      emit();
    }
  }

  ngOnDestroy(): void {
    // Change current user typing status to false:
    this.messageTextToSend = '';
    this.onMessageInputChange();
  }
}

export interface SideMessageType {
  title: string;
  messages: MessageDto[];
  participantIds?: string[];
  hasUnseenMessagesForCurrentUser: boolean;
}
