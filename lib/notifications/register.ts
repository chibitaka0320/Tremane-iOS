import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "./permissions";
import * as pushTokenApi from "@/api/pushTokenApi";
import { ApiError } from "../error";

/** Expo Push Tokenを取得しバックエンドに登録 */
export async function registerPushTokenIfNeeded() {
  try {
    const PUSH_TOKEN_REGISTERED_KEY = "push_token_registered";

    // トークン登録済み確認
    const alreadyRegistered = await AsyncStorage.getItem(
      PUSH_TOKEN_REGISTERED_KEY
    );

    if (alreadyRegistered) {
      console.log("PushToken登録済み。");
      return;
    }

    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const res = await pushTokenApi.registerPushToken(token);

    await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, "true");
    console.log("PushToken登録成功");
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`PushToken登録失敗:[${error.status}]${error.message}`);
    } else {
      console.error(`PushToken登録処理エラー：${error}`);
    }
  }
}
