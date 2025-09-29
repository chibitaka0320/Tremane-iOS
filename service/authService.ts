import * as pushTokenApi from "@/api/pushTokenApi";
import * as firebaseAuth from "firebase/auth";
import { syncLocalDb } from "@/localDb/sync/syncLocalDb";
import { auth } from "@/lib/firebaseConfig";
import { clearLocalDb } from "@/localDb/sync/clearLocalDb";
import AsyncStorage from "@react-native-async-storage/async-storage";

// サインアウト（ログアウト）
export async function signout() {
  // 同期されていないローカルデータをリモートに同期
  await syncLocalDb();

  // リモートのプッシュトークンを削除
  await pushTokenApi.unregisterPushToken();

  // firebaseサインアウト処理
  await firebaseAuth.signOut(auth);

  // ローカルDBをクリア
  await clearLocalDb();

  // AsyncStorageをクリア
  AsyncStorage.clear();
}
