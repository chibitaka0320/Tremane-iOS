import * as notificationApi from "@/api/notificationApi";
import { Notification } from "@/types/dto/notificationDto";

// 未読件数の取得
export async function getNoreadCount(): Promise<number> {
  const noreadCount = await notificationApi.getNoreadCount();
  if (!noreadCount) {
    throw new Error("未読件数の取得が不正です。APIを確認してください");
  }
  return noreadCount;
}

// 通知の既読
export async function markReadAll() {
  await notificationApi.markAllRead();
}

// 通知一覧の取得
export async function getNotification() {
  const notificationsRes = await notificationApi.getNotifications();
  let notifications: Notification[] = [];

  if (notificationsRes) {
    for (const notificationRes of notificationsRes) {
      const notification: Notification = {
        notificationId: notificationRes.notificationId,
        userId: notificationRes.userId,
        notificationSource: notificationRes.notificationSource,
        type: notificationRes.type,
        message: notificationRes.message,
        relatedId: notificationRes.relatedId,
        createdAt: notificationRes.createdAt,
        status: notificationRes.status,
      };
      notifications.push(notification);
    }
  }

  return notifications;
}
