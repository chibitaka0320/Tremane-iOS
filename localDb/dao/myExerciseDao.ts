import { db } from "@/lib/localDbConfig";
import { Exercise } from "@/types/localDb";

// 最新更新日を取得
export const getLatestMyExercise = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM exercises WHERE owner_user_id IS NOT null;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 詳細取得
export const getMyExercise = async (
  exerciseId: string
): Promise<Exercise | null> => {
  const row = await db.getFirstAsync<Exercise | null>(
    `
    SELECT
        exercise_id AS exerciseId,
        parts_id AS partsId,
        name,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM exercises
    WHERE exercise_id = ?
    `,
    [exerciseId]
  );

  return row;
};

// 非同期データの取得
export const getUnsyncedMyExercise = async (
  deleteFlg: number
): Promise<Exercise[]> => {
  const unsynced = await db.getAllAsync<Exercise>(
    `
    SELECT
        exercise_id AS exerciseId,
        parts_id AS partsId,
        name,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM exercises
    WHERE owner_user_id IS NOT NULL
    AND is_synced = 0
    AND is_deleted = ?
    `,
    [deleteFlg]
  );
  return unsynced;
};

// 追加
export const insertMyExerciseDao = async (
  exercises: Exercise[],
  syncFlg: number,
  deleteFlg: number
) => {
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      if (e.ownerUserId) {
        await db.runAsync(
          `
        INSERT INTO exercises (exercise_id, owner_user_id, parts_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            e.exerciseId,
            e.ownerUserId,
            e.partsId,
            e.name,
            syncFlg,
            deleteFlg,
            e.createdAt,
            e.updatedAt,
          ]
        );
      }
    }
  });
};

// 更新
export const updateMyExerciseDao = async (
  exercises: Exercise[],
  syncFlg: number,
  deleteFlg: number
) => {
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      if (e.ownerUserId) {
        const result = await db.runAsync(
          `
        REPLACE INTO exercises (exercise_id, owner_user_id, parts_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            e.exerciseId,
            e.ownerUserId,
            e.partsId,
            e.name,
            syncFlg,
            deleteFlg,
            e.createdAt,
            e.updatedAt,
          ]
        );
      }
    }
  });
};

// 削除
export const deleteMyExerciseDao = async (exerciseId: string) => {
  await db.runAsync(
    `UPDATE exercises SET is_deleted = 1 WHERE exercise_id = ?;`,
    [exerciseId]
  );
};

export const deleteMyExercises = async () => {
  await db.runAsync("DELETE FROM exercises WHERE owner_user_id != null;");
};

// フラグを同期済みにする
export const setMyExercisesSynced = async (exerciseId: string) => {
  await db.runAsync(
    `UPDATE exercises SET is_synced = 1 WHERE exercise_id = ?;`,
    [exerciseId]
  );
};
