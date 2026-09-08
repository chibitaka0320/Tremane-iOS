import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userProfileApi from "@/api/userProfileApi";
import { UserProfileEntity } from "@/types/db";
import { format } from "date-fns";
import { UserProfileRequest } from "@/types/api";
import { UserProfile } from "@/types/dto/userDto";

// ユーザープロフィール情報取得
export async function getUserProfile(): Promise<UserProfile | null> {
  return await userProfileRepository.getUserProfile();
}

// ユーザープロフィール情報追加更新（未設定の項目はnullのまま送信する）
export async function upsertUserProfile(
  userId: string,
  height: number | null,
  weight: number | null,
  birthday: Date | null,
  gender: number | null,
  activeLevel: number | null
) {
  const now = new Date().toISOString();
  const formattedBirthday = birthday ? format(birthday, "yyyy-MM-dd") : null;
  const userProfileEntity: UserProfileEntity = {
    user_id: userId,
    height,
    weight,
    birthday: formattedBirthday,
    gender,
    active_level: activeLevel,
    is_synced: 0,
    created_at: now,
    updated_at: now,
  };

  // ローカルDB追加更新
  await userProfileRepository.upsertUserProfile(userProfileEntity);

  // リモートDB更新（非同期）
  const userProfileRequest: UserProfileRequest = {
    userId,
    height,
    weight,
    birthday: formattedBirthday,
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
