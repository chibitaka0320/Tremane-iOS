import { db } from "@/lib/localDbConfig";
import { Eating } from "@/types/localDb";

// 最新更新日を取得
export const getLatestEating = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    `SELECT MAX(updated_at) as last_updated FROM eatings;`
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
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
