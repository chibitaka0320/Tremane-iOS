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

// POST /auth/send-verification-email
export async function sendVerificationEmail(): Promise<void> {
  await apiRequestAuth<void>("/auth/send-verification-email", "POST", null);
}

// POST /auth/send-password-reset-email
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await apiRequest<void>("/auth/send-password-reset-email", "POST", { email });
}
