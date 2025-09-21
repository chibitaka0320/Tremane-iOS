import * as userGoalRepository from "@/localDb/repository/userGoalRepository";
import * as userGoalApi from "@/api/userGoalApi";
import { UserGoalEntity } from "@/types/db";
import { format } from "date-fns";
import { UserGoalRequest } from "@/types/api";

// ユーザー目標情報追加更新
export async function upsertUserGoal(
  userId: string,
  weight: number,
  goalWeight: number,
  start: Date,
  finish: Date,
  pfc: number
) {
  const now = new Date().toISOString();
  const userGoalEntity: UserGoalEntity = {
    user_id: userId,
    weight,
    goal_weight: goalWeight,
    start: format(start, "yyyy-MM-dd"),
    finish: format(finish, "yyyy-MM-dd"),
    pfc,
    is_synced: 0,
    created_at: now,
    updated_at: now,
  };

  // ローカルDB追加更新
  await userGoalRepository.upsertUserGoal(userGoalEntity);

  // リモートDB更新（非同期）
  const userGoalRequest: UserGoalRequest = {
    userId,
    weight,
    goalWeight,
    start: format(start, "yyyy-MM-dd"),
    finish: format(finish, "yyyy-MM-dd"),
    pfc,
    createdAt: now,
    updatedAt: now,
  };

  userGoalApi
    .upsertUserGoal(userGoalRequest)
    .then(async () => await userGoalRepository.setUserGoalSynced())
    .catch((error) => {
      console.error("APIエラー(ユーザー目標情報追加更新：)" + error);
    });
}
