import { db } from "@/lib/localDbConfig";
import { Training } from "@/types/localDb";

// 最新更新日を取得
export const getLatestTraining = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM trainings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 日別トレーニング情報取得
export const getTrainingByDateDao = async (date: string) => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    parts_name: string;
    exercise_id: number;
    exercise_name: string;
    training_id: string;
    weight: number;
    reps: number;
  }>(
    `
    SELECT
      b.parts_id,
      b.name AS parts_name,
      e.exercise_id, 
      e.name AS exercise_name,
      t.training_id,
      t.weight,
      t.reps
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.date = ?
    ORDER BY t.created_at;
  `,
    [date]
  );
  return rows;
};

// 追加
export const insertTrainingDao = async (
  trainings: Training[],
  syncFlg: number,
  deleteFlg: number
) => {
  await db.withTransactionAsync(async () => {
    for (const training of trainings) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO trainings (training_id, date, user_id, exercise_id, weight, reps, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          training.trainingId,
          training.date,
          training.userId,
          training.exerciseId,
          training.weight,
          training.reps,
          syncFlg,
          deleteFlg,
          training.createdAt,
          training.updatedAt,
        ]
      );
    }
  });
};
