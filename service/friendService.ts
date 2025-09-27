import * as userApi from "@/api/userApi";
import { UserSearchResponse } from "@/types/api";

// ユーザーメールアドレス検索
export async function searchUserByEmail(
  email: string
): Promise<UserSearchResponse | null> {
  return userApi.searchUserByEmail(email);
}
