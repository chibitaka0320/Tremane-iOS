import { Exercise } from "@/types/api";
import { db } from "../db";

// 最新更新日を取得
export const getLatestExerciseUpdatedAt = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM exercises;"
  );
  return row?.last_updated ?? "2025-01-01T00:00:00";
};

// 差分データをINSERT OR REPLACEで保存
export const upsertExercises = async (items: Exercise[]) => {
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO exercises (exercise_id, parts_id, name, updated_at) VALUES (?, ?, ?, ?);`,
        [item.exerciseId, item.partsId, item.name, item.updatedAt]
      );
    }
  });
};
