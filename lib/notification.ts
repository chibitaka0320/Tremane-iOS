import * as Notifications from "expo-notifications";

/** プッシュ通知の権限リクエストおよびExpo Push Tokenの取得 */
export async function registerForPushNotificationsAsync() {
  // 現在の通知権限を確認
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 権限がまだ付与されていない場合リクエスト
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 拒否された場合は null を返却
  if (finalStatus !== "granted") {
    console.log("通知権限が拒否されました");
    return null;
  }

  // Expo Push Tokenを取得
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}
