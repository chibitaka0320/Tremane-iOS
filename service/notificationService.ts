import * as notificationApi from "@/api/notificationApi";

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
