import { Exercise, Training } from "@/types/api";
import { db } from "../lib/dbConfig";
import { TrainingRequest } from "@/types/training";
import { auth } from "@/lib/firebaseConfig";

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
        `INSERT OR REPLACE INTO trainings (training_id, date, user_id, exercise_id, weight, reps, sync_status, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.trainingId,
          item.date,
          item.userId,
          item.exerciseId,
          item.weight,
          item.reps,
          "synced",
          item.updatedAt,
          item.createdAt,
        ]
      );
    }
  });
};

// ユーザーのトレーニングデータを取得
export const selectUserTrainings = async (date: string) => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    body_part_name: string;
    exercise_id: number;
    exercise_name: string;
    training_id: number;
    weight: number;
    reps: number;
  }>(
    `
    SELECT
      b.parts_id,
      b.name AS body_part_name,
      e.exercise_id,
      e.name AS exercise_name,
      t.training_id,
      t.weight,
      t.reps
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.date = ?
    ORDER BY b.name, e.name
  `,
    [date]
  );

  return rows;
};

// トレーニングデータの追加
export const insertTrainings = async (item: TrainingRequest) => {
  const user = auth.currentUser;
  if (user) {
    const result = await db.runAsync(
      `INSERT OR REPLACE INTO trainings (date, user_id, exercise_id, weight, reps, sync_status) VALUES (?, ?, ?, ?, ?, ?);`,
      [item.date, user.uid, item.exerciseId, item.weight, item.reps, "pending"]
    );

    return result.lastInsertRowId;
  } else {
    throw new Error();
  }
};
