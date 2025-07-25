import { db } from "@/lib/localDbConfig";
import { Exercise } from "@/types/localDb";

// 最新更新日を取得
export const getLatestExercise = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM exercises;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 追加
export const insertExerciseDao = async (exercises: Exercise[]) => {
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO exercises (exercise_id, parts_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        `,
        [e.exerciseId, e.partsId, e.name, e.createdAt, e.updatedAt]
      );
    }
  });
};
