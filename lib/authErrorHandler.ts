import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "./firebaseConfig";
import { clearLocalDb } from "@/localDb/clearLocalDb";

export async function authErrorHandler() {
  Alert.alert("再度ログインしてください");
  signOut(auth);
  clearLocalDb();
  router.replace("/auth/signIn");
}
