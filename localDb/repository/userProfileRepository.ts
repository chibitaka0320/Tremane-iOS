import * as userProfileDao from "@/localDb/dao/userProfileDao";
import * as userProfileApi from "@/api/userProfileApi";
import { format } from "date-fns";
import { UserProfileResponse } from "@/types/api";
import { UserProfileEntity } from "@/types/db";

// リモートDBからユーザープロフィールデータの最新情報を同期
export async function syncUserProfilesFromRemote() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await userProfileDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const userProfileResponse = await userProfileApi.getUserProfile(formatDate);

  // 取得した情報をローカルDBに同期
  if (userProfileResponse) {
    const userProfileEntity = toEntity(userProfileResponse);
    await userProfileDao.upsertUserProfile(userProfileEntity);
  } else {
    console.log("同期対象のユーザープロフィールデータが存在しませんでした。");
  }
}

// ユーザープロフィール情報追加更新
export async function upsertUserProfile(UserProfileEntity: UserProfileEntity) {
  await userProfileDao.upsertUserProfile(UserProfileEntity);
}

// 同期済みフラグを立てる
export async function setUserProfileSynced() {
  await userProfileDao.setUserProfileSynced();
}

// レスポンスをエンティティに変換
function toEntity(userProfileResponse: UserProfileResponse): UserProfileEntity {
  return {
    user_id: userProfileResponse.userId,
    height: userProfileResponse.height,
    weight: userProfileResponse.weight,
    birthday: userProfileResponse.birthday,
    gender: userProfileResponse.gender,
    active_level: userProfileResponse.activeLevel,
    is_synced: 1,
    created_at: userProfileResponse.createdAt,
    updated_at: userProfileResponse.updatedAt,
  };
}
