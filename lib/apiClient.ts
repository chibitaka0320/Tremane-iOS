import { RefreshTokenResponse } from "@/types/api";
import { authErrorHandler } from "./authErrorHandler";
import { getDeviceInfo } from "./getDevice";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./token";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: any,
  token?: string
): Promise<T | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("http://192.168.0.45:8080" + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw res;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export async function apiRequestWithRefresh<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: any
): Promise<T | null> {
  let token = await getAccessToken();
  if (!token) {
    await authErrorHandler();
    return null;
  }

  try {
    return await apiRequest<T>(url, method, body, token);
  } catch (e) {
    if (e instanceof Response && e.status === 403) {
      try {
        await refreshAccessToken();
        token = await getAccessToken();
        if (!token) {
          await authErrorHandler();
          return null;
        }
        return await apiRequest<T>(url, method, body, token);
      } catch {
        await authErrorHandler();
        return null;
      }
    } else {
      throw e;
    }
  }
}

export async function refreshAccessToken() {
  const URL = "/auth/refresh";
  const refreshToken = await getRefreshToken();
  const deviceInfo = getDeviceInfo();

  const data = await apiRequest<RefreshTokenResponse>(URL, "POST", {
    refreshToken,
    deviceInfo,
  });
  if (data == null) {
    authErrorHandler();
  } else {
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
  }
}
