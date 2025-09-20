import { signOut } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "./firebaseConfig";
import { clearLocalDb } from "@/localDb/clearLocalDb";
import { router } from "expo-router";

let isHandling = false;

// 認証エラー時ハンドリング
export async function handleUnauthorized() {
  if (isHandling) return; // 二重実行防止
  isHandling = true;

  try {
    Alert.alert("再度ログインしてください");

    await signOut(auth);
    await clearLocalDb();

    router.dismissAll();
    router.replace("/(auth)/signIn");
  } finally {
    isHandling = false;
  }
}
