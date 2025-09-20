import * as userApi from "@/api/userApi";
import * as userDao from "@/localDb/dao/userDao";
import { UserResponse } from "@/types/api";
import { UserEntity } from "@/types/db";

// リモートDBからユーザーデータを同期
export async function syncUsersFromRemote() {
  const userResponse = await userApi.getUser();
  if (userResponse) {
    const userEntity = toEntity(userResponse);
    await userDao.insertUser(userEntity);
  } else {
    console.log(
      "同期対象のユーザーデータが存在しません。(userRepository.syncUsersFromRemote)"
    );
  }
}

// ユーザー更新
export async function updateUser(nickname: string, updatedAt: string) {
  await userDao.updateUser(nickname, updatedAt);
}

// レスポンスをエンティティに変換
function toEntity(user: UserResponse): UserEntity {
  return {
    user_id: user.userId,
    nickname: user.nickname,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
