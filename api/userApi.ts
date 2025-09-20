import { UserResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /users
export async function getUser(): Promise<UserResponse | null> {
  const res = await apiRequestAuth<UserResponse>("/users", "GET", null);
  return res.data;
}

// PUT /users
export async function updateUser(
  nickname: string,
  updatedAt: string
): Promise<void> {
  await apiRequestAuth<void>("/users", "PUT", { nickname, updatedAt });
}

// DELETE /users
export async function deleteUser() {
  await apiRequestAuth<void>("/users", "DELETE", null);
}
