import { apiRequestAuth } from "./apiRequest";

// POST /push/register
export async function registerPushToken(token: string) {
  await apiRequestAuth<void>("/push/register", "POST", { token });
}

// DELETE /push/unregister
export async function unregisterPushToken() {
  await apiRequestAuth<void>("/push/unregister", "DELETE", null);
}
