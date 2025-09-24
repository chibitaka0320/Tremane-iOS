import { db } from "@/lib/localDbConfig";
import { EatingEntity } from "@/types/db";
import { MealRecord, Nutrition } from "@/types/dto/eatingDto";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM eatings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 非同期データの取得
export async function getUnsyncedEatings(
  deleteFlg: number
): Promise<EatingEntity[]> {
  const unsynced = await db.getAllAsync<EatingEntity>(
    `
    SELECT
        eating_id ,
        date,
        user_id,
        name,
        calories,
        protein,
        fat,
        carbo,
        created_at,
        updated_at
    FROM eatings
    WHERE is_synced = 0
    AND is_deleted = ?
    `,
    [deleteFlg]
  );
  return unsynced;
}

// 日別食事情報取得
export async function getEatingsByDate(date: string): Promise<MealRecord[]> {
  const rows = await db.getAllAsync<MealRecord>(
    `
    SELECT eating_id as eatingId, date, name, calories, protein, fat, carbo
    FROM eatings
    WHERE date = ?
    AND is_deleted = 0
    ORDER BY created_at;
    `,
    [date]
  );
  return rows;
}

// 日別栄養素合計取得
export async function getNutritionTotalByDate(
  date: string
): Promise<Nutrition | null> {
  const nutrition = db.getFirstAsync<Nutrition>(
    `
    SELECT IFNULL(SUM(calories), 0) AS calories,
           IFNULL(SUM(protein), 0) AS protein,
           IFNULL(SUM(fat), 0) AS fat,
           IFNULL(SUM(carbo), 0) AS carbo
    FROM eatings
    WHERE date = ? AND is_deleted = 0;
    `,
    [date]
  );
  return nutrition;
}

// 食事詳細取得
export async function getEating(eatingId: string): Promise<MealRecord | null> {
  const eating = await db.getFirstAsync<MealRecord>(
    `
    SELECT
      eating_id as eatingId,
      date,
      name,
      calories,
      protein,
      fat,
      carbo,
      created_at as createdAt,
      updated_at as updatedAt
    FROM eatings
    WHERE eating_id = ?
    `,
    [eatingId]
  );
  return eating;
}

// 追加 or 更新
export async function upsertEatings(eatings: EatingEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const eating of eatings) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO eatings (eating_id, date, user_id, name, calories, protein, fat, carbo, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          eating.eating_id,
          eating.date,
          eating.user_id,
          eating.name,
          eating.calories,
          eating.protein,
          eating.fat,
          eating.carbo,
          eating.is_synced,
          eating.is_deleted,
          eating.created_at,
          eating.updated_at,
        ]
      );
    }
  });
}

// 削除
export async function deleteEating(eatingId: string) {
  await db.runAsync(`UPDATE eatings SET is_deleted = 1 WHERE eating_id = ?;`, [
    eatingId,
  ]);
}

// 食事データ物理削除（全削除）
export async function deleteEatings() {
  await db.runAsync(`DELETE FROM eatings;`);
}

// フラグを同期済みにする
export async function setEatingsSynced(eatingIds: string[]) {
  await db.withTransactionAsync(async () => {
    for (const eatingId of eatingIds) {
      await db.runAsync(
        `UPDATE eatings SET is_synced = 1 WHERE eating_id = ?;`,
        [eatingId]
      );
    }
  });
}
