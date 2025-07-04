import { RefreshTokenResponse } from "@/types/api";
import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./apiClient";
import { getDeviceInfo } from "./getDevice";
import { authErrorHandler } from "./authErrorHandler";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItem("accessToken");
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItem("refreshToken");
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
