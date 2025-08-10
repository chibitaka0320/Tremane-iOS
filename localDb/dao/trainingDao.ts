import { db } from "@/lib/localDbConfig";
import { Training } from "@/types/localDb";
import { TrainingWithExercise } from "@/types/training";

// 最新更新日を取得
export const getLatestTraining = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM trainings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 非同期データの取得
export const getUnsyncedTraining = async (
  deleteFlg: number
): Promise<Training[]> => {
  const unsynced = await db.getAllAsync<Training>(
    `
    SELECT
      training_id AS trainingId,
      date,
      user_id AS userId,
      exercise_id AS exerciseId,
      weight,
      reps,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM trainings
    WHERE is_synced = 0
    AND is_deleted = ?
    ;
    `,
    [deleteFlg]
  );
  return unsynced;
};

// 日別部位別トレーニング集計
export const getTrainingPartsDao = async () => {
  const rows = await db.getAllAsync<{
    date: string;
    parts_id: number;
    name: string;
  }>(
    `
    SELECT t.date, b.parts_id, b.name
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.is_deleted = 0
    GROUP BY t.date, b.parts_id;
    `
  );

  return rows;
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
      AND t.is_deleted = 0
    ORDER BY t.created_at;
  `,
    [date]
  );
  return rows;
};

// トレーニング分析データ取得
export const getTrainingDataByMaxWeightDao = async (partsId: string) => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    exercise_id: number;
    name: string;
    date: string;
    weight: number;
  }>(
    `
    WITH daily_max AS (
      SELECT
        date,
        exercise_id,
        MAX(weight) AS weight
      FROM trainings
      WHERE is_deleted = 0
      GROUP BY date, exercise_id
    ),
    ranked AS (
      SELECT
        exercise_id,
        date,
        weight,
        ROW_NUMBER() OVER (
          PARTITION BY exercise_id
          ORDER BY weight DESC, date DESC
        ) AS rn
      FROM daily_max
    )
    SELECT
      e.parts_id,
      t.exercise_id,
      e.name,
      t.date,
      t.weight
    FROM ranked t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    WHERE e.parts_id = ?
      AND t.rn <= 6
    ORDER BY t.exercise_id, t.date ASC;
  `,
    [partsId]
  );
  return rows;
};

// トレーニング詳細取得
export const getTrainingDao = async (trainingId: string) => {
  const training = await db.getFirstAsync<TrainingWithExercise>(
    `
    SELECT
      t.training_id AS trainingId,
      t.date,
      e.parts_id AS partsId,
      t.exercise_id AS exerciseId,
      t.weight,
      t.reps,
      t.created_at AS createdAt
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    WHERE t.training_id = ?
    `,
    [trainingId]
  );
  return training;
};

// 追加
export const upsertTrainingDao = async (
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

// 削除
export const deleteTrainingDao = async (trainingId: string) => {
  await db.runAsync(
    `UPDATE trainings SET is_deleted = 1 WHERE training_id = ?;`,
    [trainingId]
  );
};

export const deleteTrainings = async () => {
  await db.runAsync("DELETE FROM trainings;");
};

// フラグを同期済みにする
export const setTrainingSynced = async (trainingId: string) => {
  await db.runAsync(
    `UPDATE trainings SET is_synced = 1 WHERE training_id = ?;`,
    [trainingId]
  );
};
