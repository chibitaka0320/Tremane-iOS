import { ApiError } from "@/lib/error";
import { auth } from "@/lib/firebaseConfig";
import { handleUnauthorized } from "@/lib/sessionHandler";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

// 認証なしAPIリクエスト
export async function apiRequest<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: any
): Promise<{ status: number; data: T | null }> {
  // ヘッダー作成
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // APIリクエスト
  const res = await fetch(process.env.EXPO_PUBLIC_API_DOMAIN + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 異常時
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message ?? res.statusText;
    } catch {}

    throw new ApiError(res.status, message);
  }

  // ステータス204：ステータスのみ返す
  if (res.status === 204) {
    return { status: res.status, data: null };
  }

  const json = await res.json();
  return { status: res.status, data: json };
}

// 認証ありAPIリクエスト
export async function apiRequestAuth<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: any,
  retry = true
): Promise<{ status: number; data: T | null }> {
  // トークンの取得
  const user = auth.currentUser;
  if (!user) {
    await handleUnauthorized();
    throw new ApiError(401, "Unauthorized");
  }
  let token = await user.getIdToken();

  // ヘッダー作成
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // APIリクエスト
  const res = await fetch(process.env.EXPO_PUBLIC_API_DOMAIN + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 異常時
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message ?? res.statusText;
    } catch {}

    // ステータス401：トークンをリフレッシュし再実行（1回）
    if (res.status === 401 && retry) {
      try {
        token = await user.getIdToken(true);
        return apiRequestAuth(url, method, body, false);
      } catch {
        await handleUnauthorized();
        throw new ApiError(401, "Unauthorized");
      }
    }

    throw new ApiError(res.status, message);
  }

  // ステータス204：ステータスのみ返す
  if (res.status === 204) {
    return { status: res.status, data: null };
  }

  const json = await res.json();
  return { status: res.status, data: json };
}
