import * as userProfileDao from "@/localDb/dao/userProfileDao";
import * as userProfileApi from "@/api/userProfileApi";
import { format } from "date-fns";
import { UserProfileRequest, UserProfileResponse } from "@/types/api";
import { UserProfileEntity } from "@/types/db";
import { calcAge, calcBmr, calcTotalCalorie } from "@/lib/calc";
import { UserProfile } from "@/types/dto/userDto";

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

// ローカルDBからユーザープロフィールデータの情報を同期
export async function syncUserProfilesFromLocal() {
  // 非同期データの取得
  const userProfile = await userProfileDao.getUnsyncedUserProfile();
  if (userProfile) {
    const userProfileRequest = toRequest(userProfile);
    userProfileApi
      .upsertUserProfile(userProfileRequest)
      .then(async () => await setUserProfileSynced());
  } else {
    console.log(
      "同期対象のユーザープロフィールが存在しませんでした。（ローカル → リモート）"
    );
  }
}

// ユーザープロフィール情報取得
export async function getUserProfile(): Promise<UserProfile | null> {
  const userProfile = await userProfileDao.getUserProfile();

  if (userProfile) {
    const age = calcAge(userProfile.birthday);
    const bmr = calcBmr(
      userProfile.gender,
      userProfile.height,
      userProfile.weight,
      age
    );
    const totalCalorie = calcTotalCalorie(bmr, userProfile.active_level);

    return {
      height: userProfile.height,
      weight: userProfile.weight,
      birthday: userProfile.birthday,
      age,
      gender: userProfile.gender,
      activeLevel: userProfile.active_level,
      bmr,
      totalCalorie,
    };
  } else {
    return null;
  }
}

// ユーザープロフィール情報追加更新
export async function upsertUserProfile(userProfileEntity: UserProfileEntity) {
  await userProfileDao.upsertUserProfile(userProfileEntity);
}

// 同期済みフラグを立てる
export async function setUserProfileSynced() {
  await userProfileDao.setUserProfileSynced();
}

// ユーザープロフィール情報物理削除
export async function deleteUserProfile() {
  await userProfileDao.deleteUserProfile();
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

// エンティティをリクエストに変換
function toRequest(userProfileEntity: UserProfileEntity): UserProfileRequest {
  return {
    userId: userProfileEntity.updated_at,
    height: userProfileEntity.height,
    weight: userProfileEntity.weight,
    birthday: userProfileEntity.birthday,
    gender: userProfileEntity.gender,
    activeLevel: userProfileEntity.active_level,
    createdAt: userProfileEntity.created_at,
    updatedAt: userProfileEntity.updated_at,
  };
}
