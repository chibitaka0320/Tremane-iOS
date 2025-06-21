import { router } from "expo-router";
import { Alert } from "react-native";
import { deleteAccessToken, deleteRefreshToken } from "./token";

export async function authErrorHandler() {
  Alert.alert("再度ログインしてください");
  await deleteAccessToken();
  await deleteRefreshToken();
  router.replace("/auth/signIn");
}
