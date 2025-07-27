import { authErrorHandler } from "./authErrorHandler";
import { auth } from "./firebaseConfig";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest(
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

export async function apiRequestWithRefresh(
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

  const res: Response = await apiRequest(url, method, body, token);

  // ステータスが401であればトークンをリフレッシュし再実行
  if (res.status === 401) {
    try {
      token = await user.getIdToken(true);

      // トークンを取得できなければサインアウトする
      if (!token) {
        await authErrorHandler();
        return null;
      }

      return await apiRequest(url, method, body, token);
    } catch (e) {
      console.error(e);
      await authErrorHandler();
      return null;
    }
  } else {
    return res;
  }
}
