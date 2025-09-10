import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequestWithRefresh } from "../apiClient";
import { registerForPushNotificationsAsync } from "./permissions";

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

    const res = await apiRequestWithRefresh("/push/register", "POST", {
      token,
    });

    if (res?.ok) {
      console.log("PushToken登録成功");
      await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, "true");
    } else {
      console.error("PushToken登録失敗", res?.status);
    }
  } catch (e) {
    console.error("PushToken登録処理エラー：", e);
  }
}
