import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  sendEmailVerification,
  signInAnonymously,
  updateProfile,
  User,
} from "firebase/auth";
import * as userRepository from "@/localDb/repository/userRepository";
import * as userApi from "@/api/userApi";
import * as authApi from "@/api/authApi";
import { auth } from "@/lib/firebaseConfig";

// ユーザー情報の登録
export async function registerUser(
  email: string,
  password: string,
  nickname: string
) {
  // Firebaseにユーザー登録
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  await updateProfile(user, { displayName: nickname });

  // TODO: ローカルDBにユーザー追加が必要か？（現状はinitUserで初期化を行なっている。）

  // リモートDB追加
  try {
    await authApi.signupUser(user.uid, nickname);
  } catch (error) {
    // エラーの場合はFirebaseのユーザー削除。
    console.error("APIエラー（ユーザー登録）：" + error);
    await deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }

  // 認証メール送信
  try {
    await sendEmailVerification(user);
  } catch (error) {
    // エラーの場合はFireabseのユーザーおよびリモートDBのユーザー削除
    console.error("Firebaseエラー（認証メール送信）：" + error);
    await userApi.deleteUser();
    await deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }
}

// 匿名ユーザーの登録
export async function registerAnonymous() {
  // Firebaseに匿名登録
  const userCredential = await signInAnonymously(auth);
  const user = userCredential.user;

  // リモートDB追加
  try {
    // ニックネームは空文字
    await authApi.signupUser(user.uid, "");
  } catch (error) {
    // エラーの場合はFirebaseのユーザー削除。
    console.error("APIエラー（匿名ユーザー登録）：" + error);
    await deleteUser(user);
    throw new Error("登録処理に失敗しました。");
  }
}

// 匿名ユーザーのパスワード認証登録
export async function registerAnonymousToUser(
  user: User,
  email: string,
  password: string,
  nickname: string
) {
  const now = new Date().toISOString();

  // Firebaseの認証方法をパスワード認証に変更
  const userCredential = EmailAuthProvider.credential(email, password);
  await updateProfile(user, { displayName: nickname });
  await linkWithCredential(user, userCredential);

  // LocalDB更新
  await userRepository.updateUser(nickname, now);

  // リモートDB更新（非同期）
  userApi
    .updateUser(nickname, now)
    .catch((error) => console.error("APIエラー(ユーザー情報更新)：" + error));
}

// ユーザー情報の更新
export async function updateUser(user: User, nickname: string) {
  const now = new Date().toISOString();

  // Firebaseの表示名更新
  await updateProfile(user, { displayName: nickname });
  await user.reload();

  // LocalDB更新
  await userRepository.updateUser(nickname, now);

  // リモートDB更新（非同期）
  userApi
    .updateUser(nickname, now)
    .catch((error) => console.error("APIエラー(ユーザー情報更新)：" + error));
}
