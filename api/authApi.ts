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

// POST /auth/verify-email-code
export async function verifyEmailCode(code: string): Promise<void> {
  await apiRequestAuth<void>("/auth/verify-email-code", "POST", { code });
}

// POST /auth/send-password-reset-email
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await apiRequest<void>("/auth/send-password-reset-email", "POST", { email });
}

// POST /auth/reset-password
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await apiRequest<void>("/auth/reset-password", "POST", { token, newPassword });
}

// POST /auth/send-change-email-verification
export async function sendChangeEmailVerification(
  newEmail: string
): Promise<void> {
  await apiRequestAuth<void>("/auth/send-change-email-verification", "POST", {
    newEmail,
  });
}

// POST /auth/verify-email-change-code
export async function verifyEmailChangeCode(code: string): Promise<void> {
  await apiRequestAuth<void>("/auth/verify-email-change-code", "POST", {
    code,
  });
}
