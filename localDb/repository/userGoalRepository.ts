import * as userGoalDao from "@/localDb/dao/userGoalDao";
import * as userGoalApi from "@/api/userGoalApi";
import { format } from "date-fns";
import { UserGoalResponse } from "@/types/api";
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
    const UserGoalEntity = toEntity(userGoalResponse);
    await userGoalDao.upsertUserGoalDao(UserGoalEntity);
  } else {
    console.log("同期対象のユーザー目標データが存在しませんでした。");
  }
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
