import * as authApi from "@/api/authApi";
import * as userApi from "@/api/userApi";
import { auth } from "@/lib/firebaseConfig";
import * as userRepository from "@/localDb/repository/userRepository";
import { clearLocalDb } from "@/localDb/sync/clearLocalDb";
import { UserResponse } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as firebaseAuth from "firebase/auth";

// ユーザー情報取得
export async function getUser(): Promise<UserResponse | null> {
  return await userApi.getUser();
}

// ユーザー情報の登録
export async function registerUser(
  email: string,
  password: string,
  nickname: string
) {
  // Firebaseにユーザー登録
  const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  await firebaseAuth.updateProfile(user, { displayName: nickname });

  // TODO: ローカルDBにユーザー追加が必要か？（現状はuserSyncFromRemoteで初期化を行なっている。）

  // リモートDB追加
  try {
    await authApi.signupUser(user.uid, nickname);
  } catch (error) {
    // エラーの場合はFirebaseのユーザー削除。
    console.error("APIエラー（ユーザー登録）：" + error);
    await firebaseAuth.deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }

  // 認証メール送信
  try {
    await authApi.sendVerificationEmail();
  } catch (error) {
    // エラーの場合はFireabseのユーザーおよびリモートDBのユーザー削除
    console.error("認証メール送信エラー：" + error);
    await userApi.deleteUser();
    await firebaseAuth.deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }
}

// ユーザー情報の更新
export async function updateUser(user: firebaseAuth.User, nickname: string) {
  const now = new Date().toISOString();

  // Firebaseの表示名更新
  await firebaseAuth.updateProfile(user, { displayName: nickname });
  await user.reload();

  // LocalDB更新
  await userRepository.updateUser(nickname, now);

  // リモートDB更新（非同期）
  userApi
    .updateUser(nickname, now)
    .catch((error) => console.error("APIエラー(ユーザー情報更新)：" + error));
}

// ID（検索用ハンドル）の更新
export async function updateHandle(handle: string): Promise<void> {
  await userApi.updateHandle(handle);
}

// ユーザー削除（退会）
export async function deleteUser() {
  // カスタムトークン取得
  const customToken = await authApi.reauthToken();
  if (customToken) {
    // カスタムトークンを使用して認証
    await firebaseAuth.signInWithCustomToken(auth, customToken);

    // 現在のユーザー（再認証後）
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("ユーザー情報を取得できません。");

    // リモートDBのユーザー削除
    await userApi.deleteUser();

    // firebaseユーザーの削除
    await firebaseAuth.deleteUser(currentUser);

    // ローカルDB削除
    await clearLocalDb();

    // AsyncStorage格納情報削除
    AsyncStorage.clear();
  } else {
    throw new Error("カスタムトークンが存在しません。");
  }
}
