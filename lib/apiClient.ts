import { authErrorHandler } from "./authErrorHandler";
import { auth } from "./firebaseConfig";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequestNew(
  url: string,
  method: ApiMethod = "GET",
  body?: any,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(process.env.EXPO_PUBLIC_API_DOMAIN + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res;
}

export async function apiRequestWithRefreshNew(
  url: string,
  method: ApiMethod = "GET",
  body?: any
): Promise<Response | null> {
  const user = auth.currentUser;
  if (!user) {
    await authErrorHandler();
    return null;
  }

  let token = await user.getIdToken();

  const res: Response = await apiRequestNew(url, method, body, token);

  // ステータスが401であればトークンをリフレッシュし再実行
  if (res.status === 401) {
    try {
      token = await user.getIdToken(true);

      // トークンを取得できなければサインアウトする
      if (!token) {
        await authErrorHandler();
        return null;
      }

      return await apiRequestNew(url, method, body, token);
    } catch (e) {
      console.error(e);
      await authErrorHandler();
      return null;
    }
  } else {
    return res;
  }
}

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

  const res = await fetch(process.env.EXPO_PUBLIC_API_DOMAIN + url, {
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
  const user = auth.currentUser;
  if (!user) {
    await authErrorHandler();
    return null;
  }

  let token = await user.getIdToken();

  try {
    return await apiRequest<T>(url, method, body, token);
  } catch (e) {
    if (e instanceof Response && e.status === 401) {
      try {
        token = await user.getIdToken(true);
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
