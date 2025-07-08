import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "./firebaseConfig";

export async function authErrorHandler() {
  Alert.alert("再度ログインしてください");
  signOut(auth);
  router.replace("/auth/signIn");
}
