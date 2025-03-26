import { formatDate } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MessageDto } from 'src/app/services/messenger-service/messenger.service';

@Component({
  selector: 'app-messenger-dialog-full-view',
  templateUrl: './messenger-dialog-full-view.component.html',
  styleUrls: ['./messenger-dialog-full-view.component.scss'],
})
export class MessengerDialogFullViewComponent implements OnInit, OnChanges {
  @Input() messages: MessageDto[] | null;
  sideMessageListDisplay: SideMessageType[] = [];
  selectedMessage?: SideMessageType;

  ngOnInit(): void {
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
  }

  getMessageList(): void {
    if (!this.messages) {
      return;
    }

    const groupedMessages = new Map<
      string,
      { title: string; messages: MessageDto[]; chatGroupId?: string }
    >();

    for (const msg of this.messages) {
      if (msg.chatGroupId) {
        // Group chat messages
        if (!groupedMessages.has(msg.chatGroupId)) {
          groupedMessages.set(msg.chatGroupId, {
            title: msg.chatGroupId,
            messages: [],
            chatGroupId: msg.chatGroupId,
          });
        }
        groupedMessages.get(msg.chatGroupId)?.messages.push(msg);
      } else {
        // Direct messages
        const participants = [
          msg.senderId,
          ...(msg.recipients?.map((r) => r.userId) || []),
        ];
        const uniqueParticipants = Array.from(new Set(participants)).sort(); // Sort for consistency
        const key = uniqueParticipants.join(',');

        if (!groupedMessages.has(key)) {
          groupedMessages.set(key, {
            title: uniqueParticipants.filter((id) => id !== 'user1').join(', '), // Exclude current user
            messages: [],
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
}

export interface SideMessageType {
  title: string;
  messages: MessageDto[];
}
