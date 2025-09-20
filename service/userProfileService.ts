import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userProfileApi from "@/api/userProfileApi";
import { UserProfileEntity } from "@/types/db";
import { format } from "date-fns";
import { UserProfileRequest } from "@/types/api";

// ユーザープロフィール情報追加更新
export async function upsertUserProfile(
  userId: string,
  height: number,
  weight: number,
  birthday: Date,
  gender: number,
  activeLevel: number
) {
  const now = new Date().toISOString();
  const UserProfileEntity: UserProfileEntity = {
    user_id: userId,
    height,
    weight,
    birthday: format(birthday, "yyyy-MM-dd"),
    gender,
    active_level: activeLevel,
    is_synced: 0,
    createdAt: now,
    updatedAt: now,
  };

  // ローカルDB追加更新
  await userProfileRepository.upsertUserProfile(UserProfileEntity);

  // リモートDB更新（非同期）
  const userProfileRequest: UserProfileRequest = {
    userId,
    height,
    weight,
    birthday: format(birthday, "yyyy-MM-dd"),
    gender,
    activeLevel,
    createdAt: now,
    updatedAt: now,
  };

  userProfileApi
    .upsertUserProfile(userProfileRequest)
    .then(async () => await userProfileRepository.setUserProfileSynced())
    .catch((error) =>
      console.error("APIエラー(ユーザープロフィール情報追加更新：)" + error)
    );
}
