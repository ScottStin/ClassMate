import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationDTO } from 'src/app/shared/models/notification.mode';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-notifications-dialog',
  templateUrl: './notifications-dialog.component.html',
  styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent {
  @Output() closeDialog = new EventEmitter();
  @Input() notifications: NotificationDTO[] | null;
  @Input() currentUserId?: string | null;
  @Input() users: UserDTO[] | null;
  @Input() notifiationsLoading: boolean;

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  notificationDisplayLimit = 20;

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

  // todo - replace with helper or directive or service
  getProfilePicture(userId: string): string | null {
    const foundUser = this.users?.find((user) => user._id === userId);
    return foundUser?.profilePicture?.url ?? null;
  }

  showMoreNotifications(): void {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    this.notificationDisplayLimit = this.notificationDisplayLimit + 20;
  }
}
