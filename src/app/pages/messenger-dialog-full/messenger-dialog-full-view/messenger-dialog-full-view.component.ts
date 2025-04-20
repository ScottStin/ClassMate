/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
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
import { CreateMessagegroupDialogComponent } from 'src/app/components/create-messagegroup-dialog/create-messagegroup-dialog.component';
import {
  ConversationDto,
  CreateConversationDto,
} from 'src/app/services/conversation-service/conversation.service';
import { MessageDto } from 'src/app/services/messenger-service/messenger.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
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
  @Input() miniDilaogMode: boolean;
  @Output() sendMessage = new EventEmitter<{
    messageText: string;
    recipientIds: string[];
    conversation: CreateConversationDto | ConversationDto;
  }>();
  @Output() openFullMessenger = new EventEmitter();
  @Output() editMessage = new EventEmitter<MessageDto>();
  @Output() deleteMessage = new EventEmitter<string>();
  @Output() selectChat = new EventEmitter<ConversationDto>();
  @Output() markAsSeen = new EventEmitter<string[]>();
  @Output() deleteGroup = new EventEmitter<string>();
  @Output() changeCurrentUserTypingStatus = new EventEmitter<{
    isCurrentUserTyping: boolean;
    conversationId: string;
    currentUserId: string;
  }>();

  sideMessageChatList: ConversationDto[] = [];
  sideMessageChatListFiltered: ConversationDto[] = []; // used for search. todo - replace with message search
  selectedMessageChat?: ConversationDto;
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

  constructor(
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

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

      // get message list for side chat menu:
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
   * Get the conversation lists on the left side of the messenger pag
   */
  getMessageList(): void {
    // Display conversation on left-side list:
    if (this.conversations) {
      this.sideMessageChatList = this.conversations;
    }

    // If message is selected: display messages on right-side message list:
    if (this.selectedMessageChat) {
      this.selectedMessageChat =
        this.sideMessageChatList.find(
          (chat) => chat._id === this.selectedMessageChat?._id
        ) ?? this.selectedMessageChat;

      this.selectedMessageChat.messages = this.messages?.filter(
        (message) => message.conversationId === this.selectedMessageChat?._id
      );

      // If user was removed from a conversation:
      if (
        !this.conversations
          ?.map((convo) => convo._id)
          .includes(this.selectedMessageChat._id)
      ) {
        this.selectedMessageChat = undefined;
      }
    }

    // Sort left-side conversation list by most recent message timestamp:
    this.sideMessageChatList = this.sideMessageChatList.sort((a, b) => {
      const dateA = a.mostRecentMessage?.createdAt
        ? new Date(a.mostRecentMessage.createdAt).getTime()
        : 0;
      const dateB = b.mostRecentMessage?.createdAt
        ? new Date(b.mostRecentMessage.createdAt).getTime()
        : 0;
      return dateB - dateA; // newest date first
    });

    setTimeout(() => {
      this.scrollToChatBottom();
    });

    // Initiate sideMessageChatListFiltered, which is used for search
    this.sideMessageChatListFiltered = [...this.sideMessageChatList];
  }

  /*
   * Search convos
   * todo - currently this only searches convos by sender/name/latest messafe. It should search by all messages too
   */
  searchConvoInput(searchText: string): void {
    const flatText = searchText.toLowerCase().trim();
    this.sideMessageChatListFiltered = this.sideMessageChatList.filter(
      (convo) => {
        const convoParticipantNames = this.users
          ?.filter((user) => convo.participantIds.includes(user._id))
          .map((user) => user.name.toLowerCase().trim())
          .join();

        return (
          convo.groupName?.toLowerCase().trim().includes(flatText) ||
          convo.mostRecentMessage?.messageText
            ?.toLowerCase()
            .trim()
            .includes(flatText) ||
          convoParticipantNames?.includes(flatText)
        );
      }
    );
  }

  /*
   * When a user clicks on a message conversation
   */
  selectChatClick(chatListItem: ConversationDto): void {
    this.messageTextToSend = '';

    // Change current user typing status to false:
    this.onMessageInputChange();

    // select new convo:
    this.selectedMessageChat = chatListItem;
    this.removeAllUsersFromNewDirectConvo();
    this.startNewDirectConvoMode = false;

    // if this is the first time opening this message convo, load the messages:
    if (!this.selectedMessageChat.loaded) {
      this.selectChat.emit(chatListItem);
    }

    this.selectedMessageChat.messages = this.messages?.filter(
      (message) => message.conversationId === this.selectedMessageChat?._id
    );

    setTimeout(() => {
      this.scrollToChatBottom();
    });

    // --- Mark all as seen:
    const unseenMessages = this.selectedMessageChat.messages
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
    this.selectedMessageChat.unreadMessageForCurrentUser = false;
  }

  /*
   * Get title for conversation:
   */
  getChatTitle(conversation: ConversationDto): string {
    // If group, return gorup title:
    const groupName = conversation.groupName;
    if (groupName) {
      return groupName;
    }

    // if conversation, use particpant names for title:
    return conversation.participantIds
      .filter((participantId) => participantId !== this.currentUser._id)
      .map((participantId) => {
        const user = this.users?.find((u) => u._id === participantId);
        return user ? user.name : 'Unknown';
      })
      .join(', ');
  }

  getGroupImage(conversation?: ConversationDto): string | undefined {
    if (!conversation) {
      return undefined;
    }

    const groupImage = conversation.image?.url;
    if (groupImage) {
      return groupImage;
    } else {
      return this.users?.find(
        (user) => user._id === conversation.mostRecentMessage?.senderId
      )?.profilePicture?.url;
    }
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

  getMessageTime(timestamp?: string): string {
    if (!timestamp) {
      return '';
    }

    const time = new Date(timestamp).getTime();
    if (isNaN(time)) {
      return '';
    }

    const now = Date.now();
    const diffMs = now - time;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) {
      return 'Just now';
    }
    if (hours < 1) {
      return `${minutes} min`;
    }
    if (days < 1) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (weeks < 1) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    if (months < 1) {
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }
    if (years < 1) {
      return `${months} month${months === 1 ? '' : 's'}`;
    }
    return `${years} year${years === 1 ? '' : 's'}`;
  }

  /*
   * When a new message is receieved, check if a conversation of message conversation has unseen messages:
   */
  checkUnseenMessagesInMessageGroup(): void {
    const currentUserId = this.currentUser._id;
    this.sideMessageChatList.forEach((group) => {
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
      if (group !== this.selectedMessageChat) {
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

  openFullMessengerClick(): void {
    this.openFullMessenger.emit();
  }

  /**
   * ===========================
   * Users Typing:
   * ============================
   */

  // --- Get a list of users who are currenlying typing in the selected convo
  getUsersTyping(): UserDTO[] {
    if (!this.selectedMessageChat || !this.users) {
      return [];
    }

    return this.users.filter(
      (user) =>
        this.selectedMessageChat?.usersTyping?.includes(user._id) &&
        user._id !== this.currentUser._id
    );
  }

  // --- emit that the current user is typing
  onMessageInputChange(): void {
    const emit = (): void => {
      if (this.selectedMessageChat) {
        this.changeCurrentUserTypingStatus.emit({
          isCurrentUserTyping: this.currentUserTyping,
          conversationId: this.selectedMessageChat._id,
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

    const matchingChatItem = this.sideMessageChatList.find(
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
    if (matchingChatItem) {
      this.selectedMessageChat = matchingChatItem;
      this.selectChat.emit(matchingChatItem);
      this.selectedMessageChat.messages = this.messages?.filter(
        (message) => message.conversationId === this.selectedMessageChat?._id
      );
    } else {
      this.selectedMessageChat = undefined;
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
   * Message Groups:
   * ============================
   */

  addNewGroupClick(): void {
    const dialogRef = this.dialog.open(CreateMessagegroupDialogComponent, {
      data: {
        title: `Create New Group`,
        currentUser: this.currentUser,
        users: this.users?.filter((user) => user._id !== this.currentUser._id),
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
      if (result) {
        this.snackbarService.open(
          'info',
          'Group successfully created',
          'dismiss'
        );
      }
    });
  }

  editGroup(): void {
    const existingGroup = this.selectedMessageChat;

    const dialogRef = this.dialog.open(CreateMessagegroupDialogComponent, {
      data: {
        title: `Edit Group ${existingGroup?.groupName ?? ''}`,
        currentUser: this.currentUser,
        users: this.users?.filter((user) => user._id !== this.currentUser._id),
        existingGroup,
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
      if (result) {
        this.snackbarService.open(
          'info',
          'Group successfully updated',
          'dismiss'
        );
      }
    });
  }

  deleteGroupClick(): void {
    if (!this.selectedMessageChat?.groupName) {
      this.snackbarService.open(
        'info',
        'Error deleting group, please try again.',
        'dismiss'
      );
      return;
    }

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete group?`,
        message: `The following message will be deleted: <br><br> &nbsp; &nbsp; <i>${this.selectedMessageChat.groupName}</i> <br><br> All messages for this group will also be deleted. This cannot be undone.`,
        okLabel: `Delete`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteGroup.emit(this.selectedMessageChat?._id ?? '');
      }
    });
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
      conversation = this.selectedMessageChat;
    }
    if (conversation) {
      this.sendMessage.emit({
        messageText: this.messageTextToSend,
        conversation,
        recipientIds:
          this.selectedMessageChat?.participantIds ??
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

  ngOnDestroy(): void {
    // Change current user typing status to false:
    this.messageTextToSend = '';
    this.onMessageInputChange();
  }
}

export interface ChatMessageType {
  title: string;
  messages: MessageDto[];
  participantIds?: string[];
  hasUnseenMessagesForCurrentUser: boolean;
}
