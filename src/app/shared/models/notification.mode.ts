export interface CreateNotificationDTO {
  recipients: string[];
  message: string;
  createdBy: string;
  dateSent: number;
  seenBy: string[];
  schoolId: string;
}

export interface NotificationDTO extends CreateNotificationDTO {
  _id: string;
}