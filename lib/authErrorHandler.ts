import { router } from "expo-router";
import { Alert } from "react-native";

export function authErrorHandler() {
  Alert.alert("再度ログインしてください");
  router.replace("/auth/signIn");
}
