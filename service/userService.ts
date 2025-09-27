import * as firebaseAuth from "firebase/auth";
import * as userRepository from "@/localDb/repository/userRepository";
import * as userApi from "@/api/userApi";
import * as authApi from "@/api/authApi";
import { auth } from "@/lib/firebaseConfig";
import { clearLocalDb } from "@/localDb/sync/clearLocalDb";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    await firebaseAuth.sendEmailVerification(user);
  } catch (error) {
    // エラーの場合はFireabseのユーザーおよびリモートDBのユーザー削除
    console.error("Firebaseエラー（認証メール送信）：" + error);
    await userApi.deleteUser();
    await firebaseAuth.deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }
}

// 匿名ユーザーの登録
export async function registerAnonymous() {
  // Firebaseに匿名登録
  const userCredential = await firebaseAuth.signInAnonymously(auth);
  const user = userCredential.user;

  // リモートDB追加
  try {
    // ニックネームは空文字
    await authApi.signupUser(user.uid, "");
  } catch (error) {
    // エラーの場合はFirebaseのユーザー削除。
    console.error("APIエラー（匿名ユーザー登録）：" + error);
    await firebaseAuth.deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }
}

// 匿名ユーザーのパスワード認証登録
export async function registerAnonymousToUser(
  user: firebaseAuth.User,
  email: string,
  password: string,
  nickname: string
) {
  const now = new Date().toISOString();

  // Firebaseの認証方法をパスワード認証に変更
  const userCredential = firebaseAuth.EmailAuthProvider.credential(
    email,
    password
  );
  await firebaseAuth.updateProfile(user, { displayName: nickname });
  await firebaseAuth.linkWithCredential(user, userCredential);

  // LocalDB更新
  await userRepository.updateUser(nickname, now);

  // リモートDB更新（非同期）
  userApi
    .updateUser(nickname, now)
    .catch((error) => console.error("APIエラー(ユーザー情報更新)：" + error));
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

// ユーザー削除（退会）
export async function deleteUser(user: firebaseAuth.User) {
  // カスタムトークン取得
  const customToken = await authApi.reauthToken();
  if (customToken) {
    // カスタムトークンを使用して認証
    await firebaseAuth.signInWithCustomToken(auth, customToken);

    // リモートDBのユーザー削除
    await userApi.deleteUser();

    // firebaseユーザーの削除
    await firebaseAuth.deleteUser(user);

    // ローカルDB削除
    await clearLocalDb();

    // AsyncStorage格納情報削除
    AsyncStorage.clear();
  } else {
    throw new Error("カスタムトークンが存在しません。");
  }
}
