import { db } from "@/lib/localDbConfig";
import { Eating } from "@/types/localDb";

// 最新更新日を取得
export const getLatestEating = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM eatings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 非同期データの取得
export const getUnsyncedEating = async (
  deleteFlg: number
): Promise<Eating[]> => {
  const unsynced = await db.getAllAsync<Eating>(
    `
    SELECT
        eating_id AS eatingId,
        date,
        user_id AS userId,
        name,
        calories,
        protein,
        fat,
        carbo,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM eatings
    WHERE is_synced = 0
    AND is_deleted = ?
    `,
    [deleteFlg]
  );
  return unsynced;
};

// 日別食事情報取得
export const getEatingByDateDao = async (date: string) => {
  const rows = await db.getAllAsync<Eating>(
    `
    SELECT
        eating_id AS eatingId,
        date,
        user_id AS userId,
        name,
        calories,
        protein,
        fat,
        carbo,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM eatings
    WHERE date = ?
    AND is_deleted = 0
    ORDER BY created_at;
    `,
    [date]
  );
  return rows;
};

// 食事詳細取得
export const getEatingDao = async (eatingId: string) => {
  const eating = await db.getFirstAsync<Eating>(
    `
    SELECT
      eating_id AS eatingId,
      date,
      user_id AS userId,
      name,
      calories,
      protein,
      fat,
      carbo,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM eatings
    WHERE eating_id = ?
    `,
    [eatingId]
  );
  return eating;
};

// 追加
export const upsertEatingDao = async (
  eatings: Eating[],
  syncFlg: number,
  deleteFlg: number
) => {
  await db.withTransactionAsync(async () => {
    for (const eating of eatings) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO eatings (eating_id, date, user_id, name, calories, protein, fat, carbo, is_synced, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          eating.eatingId,
          eating.date,
          eating.userId,
          eating.name,
          eating.calories,
          eating.protein,
          eating.fat,
          eating.carbo,
          syncFlg,
          deleteFlg,
          eating.createdAt,
          eating.updatedAt,
        ]
      );
    }
  });
};

// 削除
export const deleteEatingDao = async (eatingId: string) => {
  await db.runAsync(`UPDATE eatings SET is_deleted = 1 WHERE eating_id = ?;`, [
    eatingId,
  ]);
};

// 全削除
export const deleteEatings = async () => {
  await db.runAsync(`DELETE FROM eatings;`);
};

// フラグを同期済みにする
export const setEatingSynced = async (eatingId: string) => {
  await db.runAsync(`UPDATE eatings SET is_synced = 1 WHERE eating_id = ?;`, [
    eatingId,
  ]);
};
