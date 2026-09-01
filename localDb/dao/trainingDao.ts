import { db } from "@/lib/localDbConfig";
import { TrainingEntity } from "@/types/db";
import {
  DailyTrainingRow,
  LastTraining,
  RecentExercise,
  Training,
  TrainingAnalysisRow,
  TrainingDetail,
} from "@/types/dto/trainingDto";

// 種目別・過去の記録行データ
type PastTrainingRow = {
  date: string;
  weight: number;
  reps: number;
};

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
export async function getTrainingWithBodyPart(): Promise<DailyTrainingRow[]> {
  const rows = await db.getAllAsync<DailyTrainingRow>(
    `
    SELECT
      t.date,
      b.parts_id AS partsId,
      b.name
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.is_deleted = 0
    GROUP BY t.date, b.parts_id;
    `
  );

  return rows;
}

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

// 期間内トレーニング日数・総負荷量・総セット数取得
export async function getTrainingSummaryByDateRange(
  started: string,
  ended: string
): Promise<{ trainingDays: number; totalVolume: number; totalSets: number }> {
  const row = await db.getFirstAsync<{
    training_days: number;
    total_volume: number;
    total_sets: number;
  }>(
    `
    SELECT
      COUNT(DISTINCT date) AS training_days,
      IFNULL(SUM(weight * reps), 0) AS total_volume,
      COUNT(*) AS total_sets
    FROM trainings
    WHERE date BETWEEN ? AND ?
      AND is_deleted = 0;
    `,
    [started, ended]
  );

  return {
    trainingDays: row?.training_days ?? 0,
    totalVolume: row?.total_volume ?? 0,
    totalSets: row?.total_sets ?? 0,
  };
}

// 期間内・日別総負荷量取得（週別集計のもとデータ）
export async function getDailyVolumeByDateRange(
  started: string,
  ended: string
): Promise<{ date: string; volume: number }[]> {
  const rows = await db.getAllAsync<{ date: string; volume: number }>(
    `
    SELECT
      date,
      SUM(weight * reps) AS volume
    FROM trainings
    WHERE date BETWEEN ? AND ?
      AND is_deleted = 0
    GROUP BY date;
    `,
    [started, ended]
  );
  return rows;
}

// 期間内・部位別セット数取得
export async function getBodyPartSetCountByDateRange(
  started: string,
  ended: string
): Promise<{ partsId: number; partsName: string; setCount: number }[]> {
  const rows = await db.getAllAsync<{
    partsId: number;
    partsName: string;
    setCount: number;
  }>(
    `
    SELECT
      b.parts_id AS partsId,
      b.name AS partsName,
      COUNT(*) AS setCount
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.date BETWEEN ? AND ?
      AND t.is_deleted = 0
    GROUP BY b.parts_id, b.name
    ORDER BY setCount DESC;
    `,
    [started, ended]
  );
  return rows;
}

// トレーニング分析データ取得(全部)
export async function getTrainingAllDataByMaxWeight(
  limit: number
): Promise<TrainingAnalysisRow[]> {
  const rows = await db.getAllAsync<TrainingAnalysisRow>(
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
      e.parts_id AS bodyPartId,
      t.exercise_id AS exerciseId,
      e.name AS exerciseName,
      t.date,
      t.weight
    FROM ranked t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    WHERE t.rn <= ?
    ORDER BY e.parts_id, t.exercise_id, t.date ASC;
  `,
    [limit]
  );
  return rows;
}

// トレーニング分析データ取得(部位別)
export async function getTrainingByMaxWeight(
  bodyPartId: number,
  limit: number
): Promise<TrainingAnalysisRow[]> {
  const rows = await db.getAllAsync<TrainingAnalysisRow>(
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
      e.parts_id AS bodyPartId,
      t.exercise_id AS exerciseId,
      e.name AS exerciseName,
      t.date,
      t.weight
    FROM ranked t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    WHERE e.parts_id = ?
      AND t.rn <= ?
    ORDER BY t.exercise_id, t.date ASC;
  `,
    [bodyPartId, limit]
  );
  return rows;
}

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

// 部位別・最近使った種目取得（種目ごとの直近1件）
export async function getRecentExercisesByPartsId(
  partsId: number,
  limit: number
): Promise<RecentExercise[]> {
  const rows = await db.getAllAsync<RecentExercise>(
    `
    WITH ranked AS (
      SELECT
        t.exercise_id,
        t.weight,
        t.reps,
        t.date,
        t.created_at,
        ROW_NUMBER() OVER (
          PARTITION BY t.exercise_id
          ORDER BY t.date DESC, t.created_at DESC
        ) AS rn
      FROM trainings t
      LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
      WHERE t.is_deleted = 0
        AND e.parts_id = ?
    )
    SELECT
      r.exercise_id AS exerciseId,
      e.name AS exerciseName,
      r.weight,
      r.reps,
      r.date,
      r.created_at AS createdAt
    FROM ranked r
    LEFT JOIN exercises e ON r.exercise_id = e.exercise_id
    WHERE r.rn = 1
    ORDER BY r.date DESC, r.created_at DESC
    LIMIT ?;
    `,
    [partsId, limit]
  );
  return rows;
}

// 種目別・当日セット取得
export async function getTrainingsByExerciseAndDate(
  exerciseId: string,
  date: string
): Promise<Training[]> {
  const rows = await db.getAllAsync<Training>(
    `
    SELECT
      training_id AS trainingId,
      weight,
      reps
    FROM trainings
    WHERE exercise_id = ?
      AND date = ?
      AND is_deleted = 0
    ORDER BY created_at;
    `,
    [exerciseId, date]
  );
  return rows;
}

// 種目別・過去の記録取得（指定日より前、直近N日分）
export async function getPastTrainingsByExerciseId(
  exerciseId: string,
  beforeDate: string,
  limit: number
): Promise<PastTrainingRow[]> {
  const rows = await db.getAllAsync<PastTrainingRow>(
    `
    WITH recent_dates AS (
      SELECT DISTINCT date
      FROM trainings
      WHERE exercise_id = ?
        AND is_deleted = 0
        AND date < ?
      ORDER BY date DESC
      LIMIT ?
    )
    SELECT
      t.date,
      t.weight,
      t.reps
    FROM trainings t
    JOIN recent_dates d ON t.date = d.date
    WHERE t.exercise_id = ?
      AND t.is_deleted = 0
    ORDER BY t.date DESC, t.created_at ASC;
    `,
    [exerciseId, beforeDate, limit, exerciseId]
  );
  return rows;
}

// トレーニングIDから登録日時を取得（既存レコードかどうかの判定に使用）
export async function getTrainingCreatedAt(
  trainingId: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ created_at: string }>(
    `SELECT created_at FROM trainings WHERE training_id = ?;`,
    [trainingId]
  );
  return row?.created_at ?? null;
}

// 種目の前回の記録取得
export async function getLastTrainingByExerciseId(
  exerciseId: string
): Promise<LastTraining | null> {
  const row = await db.getFirstAsync<LastTraining>(
    `
    SELECT weight, reps, date
    FROM trainings
    WHERE exercise_id = ?
      AND is_deleted = 0
    ORDER BY date DESC, created_at DESC
    LIMIT 1;
    `,
    [exerciseId]
  );
  return row;
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
