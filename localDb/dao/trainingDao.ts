import { db } from "@/lib/localDbConfig";
import { Training } from "@/types/localDb";

// 最新更新日を取得
export const getLatestTraining = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM trainings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
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
