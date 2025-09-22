import * as userGoalDao from "@/localDb/dao/userGoalDao";
import * as userGoalApi from "@/api/userGoalApi";
import { format } from "date-fns";
import { UserGoalRequest, UserGoalResponse } from "@/types/api";
import { UserGoalEntity } from "@/types/db";

// リモートDBからユーザー目標データの最新情報を同期
export async function syncUserGoalsFromRemote() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await userGoalDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const userGoalResponse = await userGoalApi.getUserGoal(formatDate);

  // 取得した情報をローカルDBに同期
  if (userGoalResponse) {
    const userGoalEntity = toEntity(userGoalResponse);
    await userGoalDao.upsertUserGoalDao(userGoalEntity);
  } else {
    console.log("同期対象のユーザー目標データが存在しませんでした。");
  }
}

// ローカルDBからユーザー目標データの情報を同期
export async function syncUserGoalsFromLocal() {
  // 非同期データの取得
  const userGoal = await userGoalDao.getUnsyncedUserGoal();
  if (userGoal) {
    const userGoalRequest = toRequest(userGoal);
    userGoalApi
      .upsertUserGoal(userGoalRequest)
      .then(async () => await setUserGoalSynced());
  } else {
    console.log(
      "同期対象のユーザー目標が存在しませんでした。（ローカル → リモート）"
    );
  }
}

// ユーザープロフィール情報追加更新
export async function upsertUserGoal(userGoalEntity: UserGoalEntity) {
  await userGoalDao.upsertUserGoalDao(userGoalEntity);
}

// 同期済みフラグを立てる
export async function setUserGoalSynced() {
  await userGoalDao.setUserGoalSynced();
}

// レスポンスをエンティティに変換
function toEntity(userGoalResponse: UserGoalResponse): UserGoalEntity {
  return {
    user_id: userGoalResponse.userId,
    weight: userGoalResponse.weight,
    goal_weight: userGoalResponse.goalWeight,
    start: userGoalResponse.start,
    finish: userGoalResponse.finish,
    pfc: userGoalResponse.pfc,
    is_synced: 1,
    created_at: userGoalResponse.createdAt,
    updated_at: userGoalResponse.updatedAt,
  };
}

// エンティティをリクエストに変換
function toRequest(userGoalEntity: UserGoalEntity): UserGoalRequest {
  return {
    userId: userGoalEntity.user_id,
    weight: userGoalEntity.weight,
    goalWeight: userGoalEntity.goal_weight,
    start: userGoalEntity.start,
    finish: userGoalEntity.finish,
    pfc: userGoalEntity.pfc,
    createdAt: userGoalEntity.created_at,
    updatedAt: userGoalEntity.updated_at,
  };
}
