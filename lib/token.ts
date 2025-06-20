import * as SecureStore from "expo-secure-store";

export async function getAccesstoken(): Promise<string | null> {
  return SecureStore.getItem("accessToken");
}
