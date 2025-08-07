import { db } from "@/lib/localDbConfig";
import { Exercise } from "@/types/localDb";

// 最新更新日を取得
export const getLatestMyExercise = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM my_exercises;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
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
    FROM my_exercises
    WHERE is_synced = 0
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
  const insertedIds: number[] = [];
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      const result = await db.runAsync(
        `
        INSERT INTO my_exercises (parts_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [e.partsId, e.name, syncFlg, deleteFlg, e.createdAt, e.updatedAt]
      );
      insertedIds.push(result.lastInsertRowId);
    }
  });

  return insertedIds;
};

// 更新
export const updateMyExerciseDao = async (
  exercises: Exercise[],
  syncFlg: number,
  deleteFlg: number
) => {
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      const result = await db.runAsync(
        `
        REPLACE INTO my_exercises (exercise_id, parts_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?)
        `,
        [
          e.exerciseId,
          e.partsId,
          e.name,
          syncFlg,
          deleteFlg,
          e.createdAt,
          e.updatedAt,
        ]
      );
    }
  });
};

// 削除
export const deleteMyExerciseDao = async (exerciseId: number) => {
  await db.runAsync(
    `UPDATE my_exercises SET is_deleted = 1 WHERE exercise_id = ?;`,
    [exerciseId]
  );
};

export const deleteMyExercises = async () => {
  await db.runAsync("DELETE FROM my_exercises;");
};

// フラグを同期済みにする
export const setMyExercisesSynced = async (exerciseId: number) => {
  await db.runAsync(
    `UPDATE my_exercises SET is_synced = 1 WHERE exercise_id = ?;`,
    [exerciseId]
  );
};
