import { Exercise, Training } from "@/types/api";
import { db } from "../db";

// 最新更新日を取得
export const getLatestTrainingUpdatedAt = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM trainings;"
  );
  return row?.last_updated ?? "2025-01-01T00:00:00";
};

// 差分データをINSERT OR REPLACEで保存
export const upsertTrainings = async (items: Training[]) => {
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO trainings (training_id, date, user_id, exercise_id, weight, reps, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.trainingId,
          item.date,
          item.userId,
          item.exerciseId,
          item.weight,
          item.reps,
          item.updatedAt,
          item.createdAt,
        ]
      );
    }
  });
};
