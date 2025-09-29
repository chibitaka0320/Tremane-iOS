// 通知用DTO
export type Notification = {
  notificationId: string;
  userId: string;
  notificationSource: string;
  type: string;
  message: string;
  relatedId: string;
  createdAt: string;
  status: string | null;
};
