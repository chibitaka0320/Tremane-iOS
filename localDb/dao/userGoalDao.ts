import { db } from "@/lib/localDbConfig";
import { UserGoalEntity } from "@/types/db";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM users_goal;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 非同期データを取得
export async function getUnsyncedUserGoal(): Promise<UserGoalEntity | null> {
  const unsynced = await db.getFirstAsync<UserGoalEntity>(
    `
    SELECT
      user_id,
      weight,
      goal_weight,
      start,
      finish,
      pfc,
      created_at,
      updated_at
    FROM
      users_goal
    WHERE
      is_synced = 0
    ;
    `
  );
  return unsynced;
}

// フラグを同期済みにする
export async function setUserGoalSynced() {
  await db.runAsync(`UPDATE users_goal SET is_synced = 1`);
}

// 取得
export async function getUserGoal(): Promise<UserGoalEntity | null> {
  const data = await db.getFirstAsync<UserGoalEntity>(
    `
    SELECT
      user_id,
      weight,
      goal_weight,
      start,
      finish,
      pfc,
      created_at,
      updated_at
    FROM users_goal;
    `
  );

  return data;
}

// 追加 or 更新
export async function upsertUserGoalDao(userGoal: UserGoalEntity) {
  await db.runAsync(
    `INSERT OR REPLACE INTO users_goal (user_id, weight, goal_weight, start, finish, pfc, is_synced, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      userGoal.user_id,
      userGoal.weight,
      userGoal.goal_weight,
      userGoal.start,
      userGoal.finish,
      userGoal.pfc,
      userGoal.is_synced,
      userGoal.created_at,
      userGoal.updated_at,
    ]
  );
}

// 削除
export async function deleteUserGoal() {
  await db.runAsync(`DELETE FROM users_goal`);
}
