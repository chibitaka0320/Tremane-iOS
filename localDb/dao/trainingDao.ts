import { db } from "@/lib/localDbConfig";
import { TrainingEntity } from "@/types/db";
import { DailyTrainingRow, TrainingDetail } from "@/types/dto/trainingDto";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM trainings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 非同期データの取得
export async function getUnsyncedTrainings(
  deleteFlg: number
): Promise<TrainingEntity[]> {
  const unsynced = await db.getAllAsync<TrainingEntity>(
    `
    SELECT
      training_id,
      date,
      user_id,
      exercise_id,
      weight,
      reps,
      created_at,
      updated_at
    FROM trainings
    WHERE is_synced = 0
    AND is_deleted = ?
    ;
    `,
    [deleteFlg]
  );
  return unsynced;
}

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
export async function getTrainingByDate(
  date: string
): Promise<DailyTrainingRow[]> {
  const rows = await db.getAllAsync<DailyTrainingRow>(
    `
    SELECT
      t.training_id AS trainingId,
      b.parts_id AS partsId,
      b.name AS partsName,
      e.exercise_id AS exerciseId, 
      e.name AS exerciseName,
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
}

// トレーニング件数取得(全部位)
export const getTrainingAllCount = async (started: string, ended: string) => {
  const rows = await db.getFirstAsync<{ count: number }>(
    `
    SELECT
      COUNT(DISTINCT(date)) AS count
    FROM trainings
    WHERE date BETWEEN ? AND ?
      AND is_deleted = 0;
    `,
    [started, ended]
  );

  return rows?.count ?? 0;
};

// トレーニング件数取得（部位別）
export const getTrainingCount = async (
  started: string,
  ended: string,
  partsId: string
) => {
  const rows = await db.getFirstAsync<{ count: number }>(
    `
    SELECT
      COUNT(DISTINCT(t.date)) AS count
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.date BETWEEN ? AND ?
      AND b.parts_id = ?
      AND t.is_deleted = 0;
    `,
    [started, ended, partsId]
  );

  return rows?.count ?? 0;
};

// トレーニング分析データ取得(全部)
export const getTrainingAllDataByMaxWeightDao = async () => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    exercise_id: string;
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
    WHERE t.rn <= 6
    ORDER BY e.parts_id, t.exercise_id, t.date ASC;
  `
  );
  return rows;
};

// トレーニング分析データ取得(部位別)
export const getTrainingDataByMaxWeightDao = async (partsId: string) => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    exercise_id: string;
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
export async function getTrainingDetail(
  trainingId: string
): Promise<TrainingDetail | null> {
  const training = await db.getFirstAsync<TrainingDetail>(
    `
    SELECT
      t.training_id AS trainingId,
      t.date,
      e.parts_id AS bodyPartId,
      t.exercise_id AS exerciseId,
      t.weight,
      t.reps
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    WHERE t.training_id = ?
    `,
    [trainingId]
  );
  return training;
}

// 追加 or 更新
export async function upsertTrainings(trainings: TrainingEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const training of trainings) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO trainings (training_id, date, user_id, exercise_id, weight, reps, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          training.training_id,
          training.date,
          training.user_id,
          training.exercise_id,
          training.weight,
          training.reps,
          training.is_synced,
          training.is_deleted,
          training.created_at,
          training.updated_at,
        ]
      );
    }
  });
}

// トレーニングデータ論理削除
export async function deleteTraining(trainingId: string) {
  await db.runAsync(
    `UPDATE trainings SET is_deleted = 1 WHERE training_id = ?;`,
    [trainingId]
  );
}

// トレーニングデータ物理削除
export async function deleteTrainings() {
  await db.runAsync("DELETE FROM trainings;");
}

// フラグを同期済みにする
export async function setTrainingsSynced(trainingIds: string[]) {
  await db.withTransactionAsync(async () => {
    for (const trainingId of trainingIds) {
      await db.runAsync(
        `UPDATE trainings SET is_synced = 1 WHERE training_id = ?;`,
        [trainingId]
      );
    }
  });
}
