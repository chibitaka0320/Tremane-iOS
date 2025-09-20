import { apiRequest } from "./apiRequest";

// POST /auth/signup
export async function signupUser(userId: string, nickname: string) {
  await apiRequest<void>("/auth/signup", "POST", { userId, nickname });
}
