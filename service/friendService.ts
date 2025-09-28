import * as userApi from "@/api/userApi";
import * as friendApi from "@/api/friendApi";
import { UserSearchResponse } from "@/types/api";
import { FriendRequest } from "@/types/dto/friendDto";

// ユーザーメールアドレス検索
export async function searchUserByEmail(
  email: string
): Promise<UserSearchResponse | null> {
  return userApi.searchUserByEmail(email);
}

// 友達申請
export async function requestFriend(
  receiveUserId: string
): Promise<FriendRequest> {
  const requestResult = await friendApi.requestFriend(receiveUserId);
  if (!requestResult) {
    throw new Error("友達申請APIの結果が存在しません。APIを確認してください");
  }

  const requestId = requestResult.requestId;
  const requestStatus = requestResult.status;
  let status;

  if ("success" === requestStatus) {
    status = "pending";
  } else if ("conflict" === requestStatus) {
    status = "pending";
  } else if ("receive" === requestStatus) {
    status = "receive";
  } else {
    throw new Error("友達申請APIのステータスが不正です。APIを確認してください");
  }

  return {
    requestId,
    status,
  };
}
