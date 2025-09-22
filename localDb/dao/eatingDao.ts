import { db } from "@/lib/localDbConfig";
import { EatingEntity } from "@/types/db";
import { Eating } from "@/types/localDb";

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

// 全削除
export const deleteEatings = async () => {
  await db.runAsync(`DELETE FROM eatings;`);
};

// フラグを同期済みにする
export const setEatingsSynced = async (eatingIds: string[]) => {
  await db.withTransactionAsync(async () => {
    for (const eatingId of eatingIds) {
      await db.runAsync(
        `UPDATE eatings SET is_synced = 1 WHERE eating_id = ?;`,
        [eatingId]
      );
    }
  });
};
