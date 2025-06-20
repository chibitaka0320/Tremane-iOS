type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest<T>(
  url: string,
  method: ApiMethod = "GET",
  body?: any,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("http://localhost:8080" + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw res;
  }

  return res.json();
}
