import { apiRequest, apiRequestAuth } from "./apiRequest";

// POST /auth/signup
export async function signupUser(userId: string, nickname: string) {
  await apiRequest<void>("/auth/signup", "POST", { userId, nickname });
}

// POST /auth/reauth-token
export async function reauthToken(): Promise<string | null> {
  const res = await apiRequestAuth<string>(`/auth/reauth-token`, "POST", null);
  return res.data;
}
