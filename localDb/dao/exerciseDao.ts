import { db } from "@/lib/localDbConfig";
import { Exercise } from "@/types/localDb";

// 最新更新日を取得
export const getLatestExercise = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM exercises WHERE owner_user_id IS null;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 追加
export const insertExerciseDao = async (exercises: Exercise[]) => {
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO exercises (exercise_id, parts_id, name, is_synced, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [e.exerciseId, e.partsId, e.name, 1, e.createdAt, e.updatedAt]
      );
    }
  });
};
