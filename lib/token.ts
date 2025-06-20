import * as SecureStore from "expo-secure-store";

export async function getAccesstoken(): Promise<string | null> {
  return SecureStore.getItem("accessToken");
}

export async function setAccessToken(accessToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
}

export async function setRefreshToken(refreshToken: string) {
  await SecureStore.setItemAsync("refreshToken", refreshToken);
}

export async function deleteAccessToken() {
  await SecureStore.deleteItemAsync("accessToken");
}

export async function deleteRefreshToken() {
  await SecureStore.deleteItemAsync("refreshToken");
}
