import { db } from "@/lib/localDbConfig";
import { UserGoalEntity } from "@/types/db";
import { UserGoal } from "@/types/localDb";

// 最新更新日を取得
export const getLastUpdatedAt = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM users_goal;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 非同期データを取得
export const getUnsyncedUserGoal = async (): Promise<UserGoal | null> => {
  const unsynced = await db.getFirstAsync<UserGoal | null>(
    `
    SELECT
      user_id AS userId,
      weight,
      goal_weight AS goalWeight,
      start,
      finish,
      pfc,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM
      users_goal
    WHERE
      is_synced = 0
    ;
    `
  );
  return unsynced;
};

// フラグを同期済みにする
export const setUserGoalSynced = async () => {
  await db.runAsync(`UPDATE users_goal SET is_synced = 1`);
};

// 取得
export const getUserGoalDao = async (): Promise<UserGoal | null> => {
  const data = await db.getFirstAsync<UserGoal | null>(
    `
    SELECT
      user_id AS userId,
      weight,
      goal_weight AS goalWeight,
      start,
      finish,
      pfc,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM users_goal;
    `
  );

  return data;
};

// 追加 or 更新
export const upsertUserGoalDao = async (userGoal: UserGoalEntity) => {
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
};

// 削除
export const deleteUserGoalDao = async () => {
  await db.runAsync(`DELETE FROM users_goal`);
};
