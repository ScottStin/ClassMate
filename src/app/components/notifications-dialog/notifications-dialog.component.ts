import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationDTO } from 'src/app/shared/models/notification.mode';

@Component({
  selector: 'app-notifications-dialog',
  templateUrl: './notifications-dialog.component.html',
  styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent {
  @Output() closeDialog = new EventEmitter();
  @Input() notifications: NotificationDTO[] | null;
  @Input() currentUserId?: string | null;

  onCloseBtnClick(): void {
    this.closeDialog.emit();
  }

  isNotificationSeen(notification: NotificationDTO): boolean {
    if (this.currentUserId ?? '') {
      return notification.seenBy.includes(this.currentUserId ?? '');
    } else {
      return false;
    }
  }
}
