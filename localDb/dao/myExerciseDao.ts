import { db } from "@/lib/localDbConfig";
import { ExerciseEntity } from "@/types/db";
import { Exercise } from "@/types/dto/exerciseDto";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM exercises WHERE owner_user_id IS NOT null;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// マイトレーニング種目詳細取得
export async function getMyExercise(
  exerciseId: string
): Promise<Exercise | null> {
  const row = await db.getFirstAsync<Exercise>(
    `
    SELECT
        exercise_id AS exerciseId,
        parts_id AS partsId,
        name,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM exercises
    WHERE exercise_id = ?
    AND owner_user_id != null
    `,
    [exerciseId]
  );

  return row;
}

// 非同期データの取得
export async function getUnsyncedMyExercises(
  deleteFlg: number
): Promise<ExerciseEntity[]> {
  const unsynced = await db.getAllAsync<ExerciseEntity>(
    `
    SELECT
        exercise_id,
        owner_user_id,
        parts_id,
        name,
        created_at,
        updated_at
    FROM exercises
    WHERE owner_user_id IS NOT NULL
    AND is_synced = 0
    AND is_deleted = ?
    `,
    [deleteFlg]
  );
  return unsynced;
}

// 追加 or 更新
export async function upsertMyExercises(exercises: ExerciseEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      if (exercise.owner_user_id) {
        const result = await db.runAsync(
          `
        INSERT INTO exercises (exercise_id, owner_user_id, parts_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(exercise_id) DO UPDATE SET
        owner_user_id = excluded.owner_user_id,
        parts_id = excluded.parts_id,
        name = excluded.name,
        is_synced = excluded.is_synced,
        is_deleted = excluded.is_deleted,
        updated_at = excluded.updated_at;
        `,
          [
            exercise.exercise_id,
            exercise.owner_user_id,
            exercise.parts_id,
            exercise.name,
            exercise.is_synced,
            exercise.is_deleted,
            exercise.created_at,
            exercise.updated_at,
          ]
        );
      }
    }
  });
}

// 削除
// TODO: 複数にするか
export async function deleteMyExercise(exerciseId: string) {
  await db.runAsync(
    `UPDATE exercises SET is_deleted = 1 WHERE exercise_id = ?;`,
    [exerciseId]
  );
}

// マイトレーニング種目データ物理削除
export async function deleteMyExercises() {
  await db.runAsync("DELETE FROM exercises WHERE owner_user_id != null;");
}

// フラグを同期済みにする
export async function setMyExercisesSynced(exerciseIds: string[]) {
  await db.withTransactionAsync(async () => {
    for (const exerciseId of exerciseIds) {
      await db.runAsync(
        `UPDATE exercises SET is_synced = 1 WHERE exercise_id = ?;`,
        [exerciseId]
      );
    }
  });
}
