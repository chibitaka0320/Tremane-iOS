import { db } from "@/lib/localDbConfig";
import { MealEntity } from "@/types/db";
import { Meal } from "@/types/dto/eatingDto";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM meals;`,
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 非同期データの取得
export async function getUnsyncedMeals(
  deleteFlg: number,
): Promise<MealEntity[]> {
  const unsynced = await db.getAllAsync<MealEntity>(
    `
    SELECT meal_id, date, user_id, name, created_at, updated_at
    FROM meals
    WHERE is_synced = 0
    AND is_deleted = ?
    `,
    [deleteFlg],
  );
  return unsynced;
}

// 食事記録詳細取得
export async function getMeal(mealId: string): Promise<Meal | null> {
  const meal = await db.getFirstAsync<Meal>(
    `
    SELECT
      meal_id as mealId,
      date,
      name,
      created_at as createdAt,
      updated_at as updatedAt
    FROM meals
    WHERE meal_id = ?
    `,
    [mealId],
  );
  return meal;
}

// 日別食事記録一覧取得
export async function getMealsByDate(date: string): Promise<Meal[]> {
  const rows = await db.getAllAsync<Meal>(
    `
    SELECT
      meal_id as mealId,
      date,
      name,
      created_at as createdAt,
      updated_at as updatedAt
    FROM meals
    WHERE date = ?
    AND is_deleted = 0
    `,
    [date],
  );
  return rows;
}

// 食事記録IDから登録日時を取得（既存レコードかどうかの判定に使用）
export async function getMealCreatedAt(mealId: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ created_at: string }>(
    `SELECT created_at FROM meals WHERE meal_id = ?;`,
    [mealId],
  );
  return row?.created_at ?? null;
}

// 追加 or 更新
export async function upsertMeals(meals: MealEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const meal of meals) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO meals (meal_id, date, user_id, name, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          meal.meal_id,
          meal.date,
          meal.user_id,
          meal.name,
          meal.is_synced,
          meal.is_deleted,
          meal.created_at,
          meal.updated_at,
        ],
      );
    }
  });
}

// 削除
export async function deleteMeal(mealId: string) {
  await db.runAsync(`UPDATE meals SET is_deleted = 1 WHERE meal_id = ?;`, [
    mealId,
  ]);
}

// 食事記録データ物理削除（全削除）
export async function deleteMeals() {
  await db.runAsync(`DELETE FROM meals;`);
}

// フラグを同期済みにする
export async function setMealsSynced(mealIds: string[]) {
  await db.withTransactionAsync(async () => {
    for (const mealId of mealIds) {
      await db.runAsync(`UPDATE meals SET is_synced = 1 WHERE meal_id = ?;`, [
        mealId,
      ]);
    }
  });
}
